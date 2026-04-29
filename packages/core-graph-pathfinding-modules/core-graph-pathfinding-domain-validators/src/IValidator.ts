
export interface IValidator<TContext> {
    validate(context: TContext): void;
}
