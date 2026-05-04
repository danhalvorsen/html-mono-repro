export interface IDragTask<TContext, TInput, TOutput> {
    canHandle(input: TInput, context: TContext): boolean;
    execute(input: TInput, context: TContext): Promise<IDragTaskResult<TContext, TOutput>>;
}

export interface IDragTaskResult<TContext, TOutput> {
    readonly context: TContext;
    readonly outputs: readonly TOutput[];
}
