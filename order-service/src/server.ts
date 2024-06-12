import fastify, {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  FastifyBaseLogger,
  FastifyError,
} from 'fastify';
import pino from 'pino';

import OrderService from './domain/OrderService';
import ApiError from './errors/ApiError';
import * as personSubscriber from './person/subscriber';
import * as personFetcher from './person/fetcher';
import * as repository from './repository'
import registerV1Routes from './api/v1'

const logger = pino({ level: 'info' });

const startServer = async (): Promise<FastifyInstance> => {
  const app = fastify({ logger: logger as FastifyBaseLogger });

  app.setErrorHandler((err: Error, request: FastifyRequest, reply: FastifyReply) => {
    const fastifyError = err as FastifyError;
    if (fastifyError.code === 'FST_ERR_VALIDATION') {
      throw err;
    }
    const error = err instanceof ApiError ? err : ApiError.from(err);
    request.log.error(error, 'Request error');
    reply.status(error.code).send({ ok: false });
  })

  registerV1Routes(app);
  
  return app;
};

// TODO: consolidate all ENV vars to one config
const port = parseInt(process.env.NODE_PORT ?? '3000', 10);

startServer()
  .then((app) => app.listen({ host: '0.0.0.0', port }, (err) => {
    if (err) {
      logger.fatal(err)
      process.exit(1)
    }
  }))
  .then(() => {
    const service = new OrderService(repository, personFetcher);
    personSubscriber.subscribe(
      (eventID, personID) => service.handleDeletion(eventID, personID),
      (eventID, personID) => service.handleUpdate(eventID, personID),
    );
  });