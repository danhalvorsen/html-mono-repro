// command-query/Dispatcher/QueryDispatcher.ts
import { Result, NonUndefined } from '../../functional/result/result.js';
import { IQuery } from '../IQuery.js';
import { QueryHandler } from '../IQueryHandler.js';

type AnyQuery = IQuery<any>;
type AnyHandler = QueryHandler<AnyQuery, NonUndefined, NonUndefined>;

export class QueryDispatcher {
  constructor(
    private readonly handlers: ReadonlyArray<AnyHandler>
  ) {}

  dispatch<
    TQuery extends IQuery<any>,
    TResult extends NonUndefined,
    TError extends NonUndefined
  >(query: TQuery): Promise<Result<TResult, TError>> {

    const handler = this.handlers.find(
      h => h.constructor.name === `${query.name}Handler`
    ) as QueryHandler<TQuery, TResult, TError> | undefined;

    if (!handler) {
      throw new Error(`No handler found for ${query.name}Handler`);
    }

    return handler.handle(query);
  }
}
