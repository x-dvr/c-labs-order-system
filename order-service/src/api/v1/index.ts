import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';
import { parse } from 'date-fns';

import * as repository from '../../repository'
import type { Order, OrderInput } from '../../domain/Order';
import OrderService from '../../domain/OrderService';
import * as personFetcher from '../../person/fetcher';
import setupCommonSchemas from './schemas';

type WithOrderId = { orderID: string };
type OrderReply = { 200: Order };
type OrdersReply = { 200: Order[] };
type OrderBody = Omit<OrderInput, 'orderDate'> & { orderDate: string };

const fromAPIBody = (body: OrderBody): OrderInput => {
  if (!body.orderDate) {
    return body as unknown as OrderInput;
  }
  return {
    ...body,
    // TODO: fix timezone to UTC
    orderDate: parse(body.orderDate, 'yyyy-MM-dd', 0),
  }
};

export default (app: FastifyInstance) => {
  setupCommonSchemas(app);
  
  app.post<{ Body: OrderBody; Reply: OrderReply }>('/api/v1/order', {
    schema: {
      body: { $ref: 'OrderInput#' },
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request, reply) => {
      const service = new OrderService(repository, personFetcher);
      const order = await service.create(fromAPIBody(request.body))

      return reply.code(200).send(order);
    },
  });

  app.get<{ Reply: OrdersReply }>('/api/v1/order', {
    schema: {
      response: {
        200: {
          type: 'array',
					items: { $ref: 'Order#' },
        }
      }
    },
    handler: async (_request, reply) => {
      const service = new OrderService(repository, personFetcher);
      const orders = await service.list();

      return reply.code(200).send(orders);
    },
  });

  app.delete('/api/v1/order', {
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
      const service = new OrderService(repository, personFetcher);
      await service.deleteAll();

      return reply.send({});
    },
  });

  app.get<{ Params: WithOrderId; Reply: OrderReply }>('/api/v1/order/:orderID', {
    schema: {
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request, reply) => {
      const { orderID } = request.params;
      const service = new OrderService(repository, personFetcher);
      const order = await service.delete(orderID);

      return reply.code(200).send(order);
    },
  });

  app.put<{ Params: WithOrderId; Body: OrderBody; Reply: OrderReply }>('/api/v1/order/:orderID', {
    schema: {
      body: { $ref: 'OrderInput#' },
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request, reply) => {
      const { orderID } = request.params;
      const service = new OrderService(repository, personFetcher);
      const order = await service.update(orderID, fromAPIBody(request.body));

      return reply.code(200).send(order);
    },
  });

  app.patch<{ Params: WithOrderId; Body: OrderBody; Reply: OrderReply }>('/api/v1/order/:orderID', {
    schema: {
      body: { $ref: 'OrderPatch#' },
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request, reply) => {
      const { orderID } = request.params;
      const service = new OrderService(repository, personFetcher);
      const order = await service.update(orderID, fromAPIBody(request.body));

      return reply.code(200).send(order);
    },
  });

  app.delete<{ Params: WithOrderId; Reply: OrderReply }>('/api/v1/order/:orderID', {
    schema: {
      response: {
        200: { $ref: 'Order#' },
      }
    },
    handler: async (request, reply) => {
      const { orderID } = request.params;
      const service = new OrderService(repository, personFetcher);
      const deletedOrder = await service.delete(orderID);

      return reply.code(200).send(deletedOrder);
    },
  });
};