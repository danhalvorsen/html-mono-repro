import type { Result, NonUndefined } from "@monorepo/core-design-patterns";


export interface IHandler<TRequest, TResult extends NonUndefined, TError extends NonUndefined> {
    Handle(request: TRequest): Promise<Result<TResult, TError>>;
}
