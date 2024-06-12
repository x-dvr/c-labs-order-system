import { Kafka } from 'kafkajs';
import * as assert from '../assert';

type Event = {
  specversion: string;
  id: string;
  source: string;
  type: 'person.deleted' | 'person.changed'; // | 'person.created';
  datacontenttype: string;
  data: {
    personid: string;
  };
}

type Handler = (eventID: string, personID: string) => Promise<void>;

export const subscribe = async (onPersonDelete: Handler, onPersonChange: Handler) => {
  const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['localhost:9093'],
  });
  const consumer = kafka.consumer({ groupId: 'order-group' });
  
  await consumer.connect()
  // TODO: how do we handle created? Should we ignore, because we don't have orders yet?
  // await consumer.subscribe({ topic: 'personevents-created', fromBeginning: true });
  await consumer.subscribe({ topic: 'personevents-changed', fromBeginning: true });
  await consumer.subscribe({ topic: 'personevents-deleted', fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const msg = message?.value?.toString();
      if (!msg) return;

      const event = JSON.parse(msg) as Event;

      switch (event.type) {
        case 'person.changed':
          return onPersonChange(event.id, event.data.personid);
        case 'person.deleted':
          return onPersonDelete(event.id, event.data.personid);
      }

      return assert.unreachable(event.type);
    },
  })
};

/**
 * Update
 * {"specversion":"1.0","id":"f6d25754-524c-4484-912a-6ae4a42fea7d","source":"http://localhost:8080/v1/api/person","type":"person.changed","datacontenttype":"application/json","data":{"personid":"6669f6b9e9845f73e633e9c8"}}
 * 
 * Create
 * {"specversion":"1.0","id":"1a63e525-f3bf-4629-a258-73a54f3794bb","source":"http://localhost:8080/v1/api/person","type":"person.created","datacontenttype":"application/json","data":{"personid":"666a08f1dbd973763a3f75fd"}}
 * 
 * Delete:
 * {"specversion":"1.0","id":"0e2e3b42-eda2-4e3d-a4b6-f8be5e101200","source":"http://localhost:8080/v1/api/person","type":"person.deleted","datacontenttype":"application/json","data":{"personid":"6669f6b9e9845f73e633e9c9"}}
 */
