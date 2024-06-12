export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  houseNumber: string;
  city: string;
  zip: string;
  country: string;
  extensionFields: Record<string, unknown>;
};