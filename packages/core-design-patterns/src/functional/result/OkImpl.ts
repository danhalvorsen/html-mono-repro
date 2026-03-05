import { SomeOption, Some, NoneOption, None } from '../option/option.js';
import { ErrResult } from './ErrResult.js';
import { Match } from './Match.js';
import { NonUndefined } from './NonUndefined.js';
import { OkResult } from './OkResult.js';
import { Result } from './result.js';
import { Ok } from './Ok.js';
import { ResultType } from './ResultType.js';

/**
 * Represents a Ok Result.
 */
export class OkImpl<T extends NonUndefined, E extends NonUndefined> implements OkResult<T, E> {
  constructor(private readonly val: T) { }

  get type() {
    return ResultType.Ok;
  }

  isOk(): this is OkResult<T, E> {
    return true;
  }

  isErr(): this is ErrResult<T, E> {
    return false;
  }

  ok(): SomeOption<T> {
    return Some(this.val);
  }

  err(): NoneOption<E> {
    return None as NoneOption<E>;
  }

  match<U extends NonUndefined | void>(matchObject: Match<T, E, U>): U {
    return matchObject.ok(this.val);
  }

  map<U extends NonUndefined>(fn: (val: T) => U): OkResult<U, E> {
    return Ok<U, E>(fn(this.val));
  }

  mapErr<U extends NonUndefined>(_fn: (err: E) => U): OkResult<T, U> {
    return Ok(this.val);
  }

  andThen<U extends NonUndefined>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.val);
  }

  orElse<F extends NonUndefined>(_fn: (err: E) => Result<T, F>): Result<T, F> {
    return Ok(this.val);
  }

  unwrap(): T {
    return this.val;
  }

  unwrapErr(): never {
    throw new ReferenceError('Cannot unwrap Err value of Result.Ok');
  }

  unwrapOr(_optb: T): T {
    return this.val;
  }
}
