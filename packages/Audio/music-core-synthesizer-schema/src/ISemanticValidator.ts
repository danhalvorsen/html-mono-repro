export interface ISemanticValidator<T> {
  validate(model: T): T;
}
