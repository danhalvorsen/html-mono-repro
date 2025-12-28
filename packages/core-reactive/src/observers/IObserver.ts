export interface IObserver<T> {
  next(value: T): void;
  error?(err: unknown): void;
  complete?(): void;
}