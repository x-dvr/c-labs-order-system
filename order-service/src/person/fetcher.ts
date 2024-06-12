import { Person } from '../domain/Person';

export const get = async (id: string, timeout: number = 200): Promise<Person> => {
  const response = await fetch(`http://localhost:8080/api/v1/person/${id}`, {
    signal: AbortSignal.timeout(timeout),
  });
  const person = await response.json() as Person;
  return person;
};