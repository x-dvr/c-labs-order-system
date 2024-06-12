import fastify, {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  FastifyBaseLogger,
  FastifyError,
} from 'fastify';
import pino from 'pino';

import ApiError from './errors/ApiError';
import registerV1Routes from './api/v1'

const logger = pino({ level: 'info' });

const startServer = async (): Promise<FastifyInstance> => {
  const app = fastify({ logger: logger as FastifyBaseLogger });

  app.setErrorHandler((err: Error, request: FastifyRequest, reply: FastifyReply) => {
    const fastifyError = err as FastifyError;
    if (fastifyError.code === 'FST_ERR_VALIDATION') {
      console.log('VALIDATION')
      throw err;
    }
    const error = err instanceof ApiError ? err : ApiError.from(err);
    request.log.error(error, 'Request error');
    reply.status(error.code).send({ ok: false });
  })

  registerV1Routes(app);
  
  return app;
};

startServer()
  .then((app) => app.listen({ port: 3000 }, (err) => {
    if (err) {
      logger.fatal(err)
      process.exit(1)
    }
  }));