import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

import ApiError from '../../errors/ApiError';
import setupCommonSchemas from './schemas';

export default (app: FastifyInstance) => {
  setupCommonSchemas(app);

  app.get('/api/v1/order', {
    schema: {
      response: {
        200: {
          type: 'array',
					items: { $ref: 'Order#' },
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
      return reply.send([]);
    },
  });
  
  app.post('/api/v1/order', {
    schema: {
      body: { $ref: 'InputOrder#' },
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
      return reply.send(request.body);
    },
  });

  app.delete('/api/v1/order', {
    handler: async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
      return reply.send({});
    },
  });

  type WithOrderId = { orderID: string };
  app.get('/api/v1/order/:orderID', {
    schema: {
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request: FastifyRequest<{ Params: WithOrderId }>, reply: FastifyReply): Promise<FastifyReply> => {
      const { orderID } = request.params;
      return reply.send({});
    },
  });

  app.put('/api/v1/order/:orderID', {
    schema: {
      body: { $ref: 'InputOrder#' },
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request: FastifyRequest<{ Params: WithOrderId }>, reply: FastifyReply): Promise<FastifyReply> => {
      const { orderID } = request.params;
      return reply.send(request.body);
    },
  });

  app.patch('/api/v1/order/:orderID', {
    schema: {
      body: { $ref: 'InputOrderPatch#' },
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request: FastifyRequest<{ Params: WithOrderId }>, reply: FastifyReply): Promise<FastifyReply> => {
      const { orderID } = request.params;
      return reply.send(request.body);
    },
  });

  app.delete('/api/v1/order/:orderID', {
    schema: {
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request: FastifyRequest<{ Params: WithOrderId }>, reply: FastifyReply): Promise<FastifyReply> => {
      const { orderID } = request.params;
      return reply.send({});
    },
  });
};