import { NonUndefined } from './NonUndefined.js';
import { OkResult } from './OkResult.js';
import { Result } from './result.js';

/**
 * Type guard to check if a Result is an Ok value.
 * This function is used to narrow down the type of a Result to OkResult in TypeScript type system.
 *
 * @deprecated Use `Result.isOk` instead.
 * @param val The Result to be checked.
 * @returns true if the provided Result is an OkResult, false otherwise.
 *
 * #### Example
 *
 * ```ts
 * const result = Ok('Success');
 * if (isOk(result)) {
 *   console.log('Operation was successful:', result.unwrap());
 * }
 * ```
 */

export function isOk<T extends NonUndefined, E extends NonUndefined>(
  val: Result<T, E>
): val is OkResult<T, never> {
  return val.isOk();
}
