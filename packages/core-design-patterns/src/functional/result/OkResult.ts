import { SomeOption, NoneOption } from '../option/option.js';
import { NonUndefined } from './NonUndefined.js';
import { Result } from './result.js';

/**
 * Implementation of Result representing a successful value (Ok).
 */
export interface OkResult<T extends NonUndefined, E extends NonUndefined> extends Result<T, E> {
  ok(): SomeOption<T>;
  err(): NoneOption<E>;
  unwrap: () => T;
  unwrapErr: () => never;
  map<U extends NonUndefined>(fn: (val: T) => U): OkResult<U, E>;
  mapErr<U extends NonUndefined>(fn: (err: E) => U): OkResult<T, U>;
}
