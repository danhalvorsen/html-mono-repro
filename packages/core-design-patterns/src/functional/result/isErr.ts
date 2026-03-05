import { ErrResult } from './ErrResult.js';
import { NonUndefined } from './NonUndefined.js';
import { Result } from './result.js';

/**
 * Type guard to check if a Result is an Err value.
 * This function is used to narrow down the type of a Result to ErrResult in TypeScript type system.
 *
 * @deprecated Use `Result.isErr` instead.
 * @param val The Result to be checked.
 * @returns true if the provided Result is an ErrResult, false otherwise.
 *
 * #### Example
 *
 * ```ts
 * const result = Err('Failure');
 * if (isErr(result)) {
 *   console.log('Operation failed with error:', result.unwrapErr());
 * }
 * ```
 */

export function isErr<T extends NonUndefined, E extends NonUndefined>(
  val: Result<T, E>
): val is ErrResult<never, E> {
  return val.isErr();
}
