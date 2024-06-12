import { MongoClient, ObjectId } from 'mongodb';

import * as assert from '../assert';
import type { OrderInput, Order } from '../domain/Order';
import type { Person } from '../domain/Person';
import getPersonIDs from '../domain/getPersonIDs';
import ApiError from '../errors/ApiError';

// TODO: consolidate all ENV vars to one config
const mongoURI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017';

const client = new MongoClient(mongoURI);
const database = client.db('order');

const ordersCollection = database.collection<Required<OrderInput>>('orders');
const personsCollection = database.collection<Person>('persons');

// TODO: ensure indexes for "id" field of persons

const mapUpdate = (patch: Record<string, unknown>) => {
  return { $set: patch };
};

export const create = async (input: Required<OrderInput>, persons: Person[]): Promise<Order> => {
  const savedPersons = new Map<string, Person>();
  // return client.withSession((s) => s.withTransaction(async (session) => {
    const { insertedId } = await ordersCollection.insertOne(input/*, { session }*/);
    const orderDoc = await ordersCollection.findOne({ _id: insertedId });
    assert.isDefined(orderDoc, 'Failed to save order');

    for (const person of persons) {
      // TODO: properly handle update results
      const { upsertedId } = await personsCollection.updateOne(
        { id: person.id },
        mapUpdate(person),
        { /*session,*/ upsert: true },
      );
      const filter = upsertedId ? { _id: upsertedId } : { id: person.id };
      const p = await personsCollection.findOne(filter);
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
  // }));
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
  // return client.withSession((s) => s.withTransaction(async (session) => {
    // TODO: properly handle update results
    await ordersCollection.updateOne({ _id: new ObjectId(id) }, mapUpdate(patch)/*, { session }*/);
    const orderDoc = await ordersCollection.findOne({ _id: new ObjectId(id) });
    assert.isDefined(orderDoc, 'Failed to update order');
    
    for (const person of persons) {
      // TODO: properly handle update results
      const { upsertedId } = await personsCollection.updateOne(
        { id: person.id },
        mapUpdate(person),
        { /*session,*/ upsert: true },
      );
      const filter = upsertedId ? { _id: upsertedId } : { id: person.id };
      const p = await personsCollection.findOne(filter);
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
  // }));
};

// TODO: do we need to take care about deleting unused persons?
export const deleteOne = async (id: string): Promise<void> => {
  await ordersCollection.deleteOne({ _id: new ObjectId(id) });
};

// TODO: do we need to take care about deleting unused persons?
export const deleteAll = async (): Promise<void> => {
  await ordersCollection.deleteMany({});
};

export const updatePerson = async (personID: string, person: Person) => {
  // TODO: properly handle update results
  await personsCollection.updateOne(
    { id: personID },
    mapUpdate(person),
    { upsert: true },
  );
}

export const deletePerson = async (personID: string) => {
  // TODO: use transaction if we have mongo replica set
  await personsCollection.deleteOne({ id: personID });
  await ordersCollection.deleteMany({
    $or: [
      { soldToID: personID },
      { billToID: personID },
      { shipToID: personID },
    ],
  })
}
