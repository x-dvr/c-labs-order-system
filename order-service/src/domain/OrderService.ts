import ApiError from '../errors/ApiError';
import type { Order, OrderInput } from './Order';
import type { Person } from './Person';
import getPersonIDs from './getPersonIDs';

interface IOrderRepository {
  create(input: Required<OrderInput>, persons: Person[]): Promise<Order>;
  list(): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  getInput(id: string): Promise<OrderInput | null>;
  update(id: string, patch: Partial<OrderInput>, persons: Person[]): Promise<Order>;
  deleteAll(): Promise<void>;
  deleteOne(id: string): Promise<void>;
}

interface IPersonFetcher {
  get(id: string): Promise<Person>;
}

class OrderService {
  constructor(
    private repository: IOrderRepository,
    private personFetcher: IPersonFetcher,
  ) {}

  async create(input: OrderInput): Promise<Order> {
    const uniqueIDs = getPersonIDs(input);
    const persons = await Promise.all(uniqueIDs.map((id) => this.personFetcher.get(id)));

    return this.repository.create({
      ...input,
      billToID: input.billToID ?? input.soldToID,
      shipToID: input.shipToID ?? input.soldToID,
    }, persons);
  }

  list(): Promise<Order[]> {
    return this.repository.list()
  }

  async get(id: string): Promise<Order> {
    const order = await this.repository.get(id);
    if (!order) throw new ApiError(404, 'Order not found');

    return order;
  }

  async update(id: string, patch: Partial<OrderInput>): Promise<Order> {
    // TODO: we can add modifiedAt and update with regards to it, to fix concurrency issues
    const oldOrder = await this.repository.getInput(id);
    if (!oldOrder) throw new ApiError(400, 'Can`t update non-existing order');

    const personIDs = new Set<string>();
    if (patch.soldToID && patch.soldToID !== oldOrder.soldToID) {
      personIDs.add(patch.soldToID);
    }
    if (patch.billToID && patch.billToID !== oldOrder.billToID) {
      personIDs.add(patch.billToID);
    }
    if (patch.shipToID && patch.shipToID !== oldOrder.shipToID) {
      personIDs.add(patch.shipToID);
    }

    const persons = await Promise.all(Array.from(personIDs).map((id) => this.personFetcher.get(id)));

    return this.repository.update(id, patch, persons);
  }

  deleteAll(): Promise<void> {
    return this.repository.deleteAll();
  }

  async delete(id: string): Promise<Order> {
    const order = await this.repository.get(id);
    if (!order) throw new ApiError(404, 'Order not found');

    await this.repository.deleteOne(id);

    return order;
  }
}

export default OrderService;