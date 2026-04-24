import type { Result, NonUndefined } from "@monorepo/core-design-patterns";
import type { IQuery } from "./IQuery.js";
// ======================================================================================
// packages/core-design-patterns-cqrs/src/query/IQuery.ts
// ======================================================================================
import type { IQueryBase } from "./IQueryBase.js";


export abstract class QueryHandler<
    TMessage extends IQueryBase,
    TResult extends NonUndefined,
    TError extends NonUndefined
> {
    public abstract Handle(query: IQuery<TMessage>): Promise<Result<TResult, TError>>;
}
