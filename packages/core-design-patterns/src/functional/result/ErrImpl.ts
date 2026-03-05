import { NoneOption, None, SomeOption, Some } from '../option/option.js';
import { ErrResult } from './ErrResult.js';
import { Match } from './Match.js';
import { NonUndefined } from './NonUndefined.js';
import { OkResult } from './OkResult.js';
import { Result } from './result.js';
import { Err } from './Err.js';
import { ResultType } from './ResultType.js';

/**
 * Represents an Err Result.
 */
export class ErrImpl<T extends NonUndefined, E extends NonUndefined> implements ErrResult<T, E> {
  constructor(private readonly val: E) { }

  get type() {
    return ResultType.Err;
  }

  isOk(): this is OkResult<T, E> {
    return false;
  }

  isErr(): this is ErrResult<T, E> {
    return true;
  }

  ok(): NoneOption<T> {
    return None as NoneOption<T>;
  }

  err(): SomeOption<E> {
    return Some(this.val);
  }

  match<U extends NonUndefined | void>(matchObject: Match<T, E, U>): U {
    return matchObject.err(this.val);
  }

  map<U extends NonUndefined>(_fn: (val: T) => U): ErrResult<U, E> {
    return Err(this.val);
  }

  mapErr<U extends NonUndefined>(fn: (err: E) => U): ErrResult<T, U> {
    return Err(fn(this.val));
  }

  andThen<U extends NonUndefined>(_fn: (val: T) => Result<U, E>): Result<U, E> {
    return Err(this.val);
  }

  orElse<F extends NonUndefined>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return fn(this.val);
  }

  unwrap(): never {
    throw new ReferenceError('Cannot unwrap Ok value of Result.Err');
  }

  unwrapErr(): E {
    return this.val;
  }

  unwrapOr(optb: T): T {
    return optb;
  }
}
