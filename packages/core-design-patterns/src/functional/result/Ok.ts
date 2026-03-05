import { NonUndefined } from './NonUndefined.js';
import { OkImpl } from './OkImpl.js';
import { OkResult } from './OkResult.js';

/**
 * Creates an Ok instance of Result containing the success value.
 * This function is used to represent a successful result in operations that could potentially fail.
 *
 * @param val The value to be contained within the Ok Result.
 * @returns A Result instance representing success and containing the provided value.
 *
 * #### Example
 *
 * ```ts
 * const successResult = Ok(42);
 * console.log(successResult.unwrap()); // Outputs: 42
 * ```
 */

export function Ok<T extends NonUndefined, E extends NonUndefined = never>(val: T): OkResult<T, E> {
  return new OkImpl(val);
}
