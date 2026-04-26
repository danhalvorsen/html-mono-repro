import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import { NumberSpecifications } from "../common/index.js";
import type {
  DecibelsValue,
  LinearGainValue,
} from "../../types/index.js";

export class DecibelsSpecification extends Specification<DecibelsValue> {
  private readonly specification = NumberSpecifications.finite();

  public isSatisfiedBy(candidate: DecibelsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<DecibelsValue> {
    return new DecibelsSpecification();
  }
}

export class LinearGainSpecification extends Specification<LinearGainValue> {
  private readonly specification = NumberSpecifications.nonNegativeFinite();

  public isSatisfiedBy(candidate: LinearGainValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<LinearGainValue> {
    return new LinearGainSpecification();
  }

  public static positive(): ISpecification<LinearGainValue> {
    return NumberSpecifications.positiveFinite();
  }
}
