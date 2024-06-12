import { MongoClient, ObjectId } from 'mongodb';

import * as assert from '../assert';
import type { OrderInput, Order } from '../domain/Order';
import type { Person } from '../domain/Person';
import getPersonIDs from '../domain/getPersonIDs';
import ApiError from '../errors/ApiError';

const client = new MongoClient('mongodb://127.0.0.1:27017');
const database = client.db('order');

const ordersCollection = database.collection<Required<OrderInput>>('orders');
const personsCollection = database.collection<Person>('persons');

// TODO: ensure indexes for "id" field of persons

const mapUpdate = (patch: Record<string, unknown>) => {
  const mapped = Object.entries(patch).map(([key, val]) => ([key, { $set: val }]));
  return Object.fromEntries(mapped);
};

export const create = async (input: Required<OrderInput>, persons: Person[]): Promise<Order> => {
  const savedPersons = new Map<string, Person>();
  return client.withSession((s) => s.withTransaction(async (session) => {
    const { insertedId } = await ordersCollection.insertOne(input, { session });
    const orderDoc = await ordersCollection.findOne({ _id: insertedId });
    assert.isDefined(orderDoc, 'Failed to save order');

    console.log('ORDER DOC:', orderDoc);
    for (const person of persons) {
      const p = await personsCollection.findOneAndUpdate({ id: person.id }, mapUpdate(person), { session, upsert: true });
      assert.isDefined(p, 'Failed to save person');
      savedPersons.set(p.id, p);
      console.log('NEW PERSON', p);
    }

    const soldTo = savedPersons.get(orderDoc.soldToID);
    const billTo = savedPersons.get(orderDoc.billToID);
    const shipTo = savedPersons.get(orderDoc.shipToID);
    if (!soldTo || !billTo || !shipTo) throw new ApiError(500, 'Missing persons');
    
    return {
      ...orderDoc,
      orderID: orderDoc?._id.toString(),
      soldTo,
      billTo,
      shipTo,
    }
  }));
};

export const list = async (): Promise<Order[]> => {
  // TODO: do we need pagination?
  const orderDocs = await ordersCollection.find().toArray();
  const uniqueIDs = getPersonIDs(orderDocs);
  const personsArr = await personsCollection.find({ id: { $in: uniqueIDs } }).toArray();
  assert.isTrue(personsArr.length === uniqueIDs.length, 'Missing persons');

  const persons = new Map(personsArr.map(person => [person.id, person]));

  return orderDocs.map((orderDoc) => {
    const soldTo = persons.get(orderDoc.soldToID);
    const billTo = persons.get(orderDoc.billToID);
    const shipTo = persons.get(orderDoc.shipToID);
    if (!soldTo || !billTo || !shipTo) throw new ApiError(500, 'Missing persons');

    return {
      ...orderDoc,
      orderID: orderDoc?._id.toString(),
      soldTo,
      billTo,
      shipTo,
    }
  });
};

export const getInput = async (id: string): Promise<OrderInput | null> => {
  return ordersCollection.findOne({ _id: new ObjectId(id) });
};

export const get = async (id: string): Promise<Order | null> => {
  const orderDoc = await ordersCollection.findOne({ _id: new ObjectId(id) });
  if (!orderDoc) return null;

  const uniqueIDs = getPersonIDs(orderDoc);
  const persons = await personsCollection.find({ id: { $in: uniqueIDs } }).toArray();
  assert.isTrue(persons.length === uniqueIDs.length, 'Missing persons');

  const soldTo = persons.find(({ id }) => id === orderDoc.soldToID);
  const billTo = persons.find(({ id }) => id === orderDoc.billToID);
  const shipTo = persons.find(({ id }) => id === orderDoc.shipToID);
  if (!soldTo || !billTo || !shipTo) throw new ApiError(500, 'Missing persons');

  return {
    ...orderDoc,
    orderID: orderDoc?._id.toString(),
    soldTo,
    billTo,
    shipTo,
  }
};

export const update = async (id: string, patch: Partial<OrderInput>, persons: Person[]): Promise<Order> => {
  const savedPersons = new Map<string, Person>();
  return client.withSession((s) => s.withTransaction(async (session) => {
    const orderDoc = await ordersCollection.findOneAndUpdate({ _id: new ObjectId(id) }, mapUpdate(patch), { session });
    assert.isDefined(orderDoc, 'Failed to update order');

    for (const person of persons) {
      const p = await personsCollection.findOneAndUpdate({ id: person.id }, mapUpdate(person), { session, upsert: true });
      assert.isDefined(p, 'Failed to save person');
      savedPersons.set(p.id, p);
    }

    const soldTo = savedPersons.get(orderDoc.soldToID);
    const billTo = savedPersons.get(orderDoc.billToID);
    const shipTo = savedPersons.get(orderDoc.shipToID);
    if (!soldTo || !billTo || !shipTo) throw new ApiError(500, 'Missing persons');
    
    return {
      ...orderDoc,
      orderID: orderDoc?._id.toString(),
      soldTo,
      billTo,
      shipTo,
    }
  }));
};

// TODO: do we need to take care about deleting unused persons?
export const deleteOne = async (id: string): Promise<void> => {
  await ordersCollection.deleteOne({ _id: new ObjectId(id) });
};

// TODO: do we need to take care about deleting unused persons?
export const deleteAll = async (): Promise<void> => {
  await ordersCollection.deleteMany({});
};
