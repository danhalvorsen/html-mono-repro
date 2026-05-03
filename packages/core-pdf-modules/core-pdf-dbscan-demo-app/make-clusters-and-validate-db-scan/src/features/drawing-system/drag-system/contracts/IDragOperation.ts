export interface IDragOperation<TInput, TOutput> {
    dispatch(input: TInput): Promise<readonly TOutput[]>;
}
