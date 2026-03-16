// packages/core-specifications/src/specifications/Specification.ts

import { AndSpecification } from "./AndSpecification.js";
import type { ISpecification } from "./ISpecification.js";
import { NotSpecification } from "./NotSpecification.js";
import { OrSpecification } from "./OrSpecification.js";

export abstract class Specification<T> implements ISpecification<T> {
  public abstract isSatisfiedBy(candidate: T): boolean;

  public and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  public or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  public not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}