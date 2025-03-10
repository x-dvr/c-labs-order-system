import { Person } from '../domain/Person';

// TODO: consolidate all ENV vars to one config
const contractApiURL = process.env.CONTRACT_API ?? 'localhost:8080';

export const get = async (id: string, timeout: number = 200): Promise<Person> => {
  const response = await fetch(`http://${contractApiURL}/api/v1/person/${id}`, {
    signal: AbortSignal.timeout(timeout),
  });
  const person = await response.json() as Person;
  return person;
};