// command-query/IQueryHandler.ts
import { Result, NonUndefined } from '../functional/result/result.js';
import { IQuery } from './IQuery.js';
import Handlebars from 'handlebars';

export abstract class QueryHandler<
  TQuery extends IQuery<any>,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  public abstract handle(query: TQuery): Promise<Result<TResult, TError>>;
}
