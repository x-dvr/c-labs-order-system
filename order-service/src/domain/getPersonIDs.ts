import { OrderInput } from './Order';

export default (input: OrderInput | OrderInput[]): string[] => {
  const inputs = Array.isArray(input) ? input : [input];

  const personIDs = inputs.reduce((acc, input) => {
    acc.add(input.soldToID);
    if (input.billToID) acc.add(input.billToID);
    if (input.shipToID) acc.add(input.shipToID);
    return acc;
  }, new Set<string>())
  

  return Array.from(personIDs);
};
