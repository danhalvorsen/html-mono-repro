import { NonUndefined, Result } from "@monorepo/core-design-patterns";
import { IQueryBase } from "./query/IQueryBase.js";
import { IQuery } from "./query/IQuery.js";

export abstract class QueryHandler<
  TMessage extends IQueryBase,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  public abstract handle(query: IQuery<TMessage>): Promise<Result<TResult, TError>>;
}
