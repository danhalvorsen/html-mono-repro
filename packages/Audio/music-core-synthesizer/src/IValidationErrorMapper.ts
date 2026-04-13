export interface IValidationErrorMapper<TError> {
  map(errors: readonly TError[]): readonly string[];
}
