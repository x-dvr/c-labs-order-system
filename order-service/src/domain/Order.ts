import { Person } from './Person';

export type OrderItem = {
  itemID: string;
  productID: string;
  quantity: number;
  itemPrice: number;
};

export type OrderInput = {
  orderDate: Date;
  soldToID: string;
  billToID?: string;
  shipToID?: string;
  orderValue: number;
  taxValue: number;
  currencyCode: string;
  items: OrderItem[];
};

export type Order = {
  orderID: string;
  orderDate: Date;
  soldTo: Person;
  billTo: Person;
  shipTo: Person;
  orderValue: number;
  taxValue: number;
  currencyCode: string;
  items: OrderItem[];
};