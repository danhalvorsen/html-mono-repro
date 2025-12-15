import { AndSpecification } from "./AndSpecification.js";
import { ISpecification } from "./ISpecification.js";
import { OrSpecification } from "./OrSpecification.js";

export class NotSpecification<T> implements ISpecification<T> {
  constructor(private readonly inner: ISpecification<T>) {}

  isSatisfiedBy(candidate: T): boolean {
    return !this.inner.isSatisfiedBy(candidate);
  }

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return this.inner;
  }
}
