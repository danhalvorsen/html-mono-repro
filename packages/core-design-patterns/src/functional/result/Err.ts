import { ErrImpl } from './ErrImpl.js';
import { ErrResult } from './ErrResult.js';
import { NonUndefined } from './NonUndefined.js';

/**
 * Creates an Err instance of Result containing the error value.
 * This function is used to represent a failure in operations that could potentially fail.
 *
 * @param val The error value to be contained within the Err Result.
 * @returns A Result instance representing an error and containing the provided error value.
 *
 * #### Example
 *
 * ```ts
 * const errorResult = Err('Something went wrong');
 * console.log(errorResult.unwrapErr()); // Outputs: Something went wrong
 * ```
 */

export function Err<T extends NonUndefined, E extends NonUndefined>(val: E): ErrResult<T, E> {
  return new ErrImpl(val);
}
