import { NoneOption, SomeOption } from '../option/option.js';
import { NonUndefined } from './NonUndefined.js';
import { Result } from './result.js';

/**
 * Implementation of Result representing an error value (Err).
 */
export interface ErrResult<T extends NonUndefined, E extends NonUndefined> extends Result<T, E> {
  ok(): NoneOption<T>;
  err(): SomeOption<E>;
  unwrap: () => never;
  unwrapErr: () => E;
  map<U extends NonUndefined>(fn: (val: T) => U): ErrResult<U, E>;
  mapErr<U extends NonUndefined>(fn: (err: E) => U): ErrResult<T, U>;
}
