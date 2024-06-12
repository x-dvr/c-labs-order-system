import ApiError from './errors/ApiError';

export function isDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new ApiError(500, message);
  }
}

export function isTrue(condition: boolean, message: string): asserts condition is true {
  if (!condition) throw new ApiError(500, message);
}
