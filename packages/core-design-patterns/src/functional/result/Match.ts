/**
 * Interface for handling match operations on a Result.
 * Allows executing different logic based on the Result being Ok or Err.
 */
export interface Match<T, E, U> {
  ok: (val: T) => U;
  err: (val: E) => U;
}
