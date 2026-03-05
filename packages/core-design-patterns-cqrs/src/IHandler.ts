import { NonUndefined, Result } from "@monorepo/core-design-patterns";
import { IQuery } from "./query/IQuery.js";
import { IQueryBase } from "./query/IQueryBase.js";

export interface IHandler<TMessage extends IQueryBase, TResult extends NonUndefined, TError extends NonUndefined> {
  Handle(query: IQuery<TMessage>): Promise<Result<TResult, TError>>;
}
