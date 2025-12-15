
export type QueryHandler<TQuery, TResponse> =
    (query: TQuery) => Promise<TResponse>;

export abstract class QueryBase<TResponse> {
    protected abstract readonly handler: QueryHandler<this, TResponse>;

    public execute(): Promise<TResponse> {
        return this.handler(this);
    }
}