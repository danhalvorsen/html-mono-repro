import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import { NumberSpecifications } from "../common/index.js";
import type {
  MillisecondsValue,
  SamplesValue,
  SecondsValue,
} from "../../types/index.js";

export class SecondsSpecification extends Specification<SecondsValue> {
  private readonly specification = NumberSpecifications.nonNegativeFinite();

  public isSatisfiedBy(candidate: SecondsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<SecondsValue> {
    return new SecondsSpecification();
  }

  public static positive(): ISpecification<SecondsValue> {
    return new PositiveSecondsSpecification();
  }
}

export class PositiveSecondsSpecification extends Specification<SecondsValue> {
  private readonly specification = NumberSpecifications.positiveFinite();

  public isSatisfiedBy(candidate: SecondsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class MillisecondsSpecification extends Specification<MillisecondsValue> {
  private readonly specification = NumberSpecifications.nonNegativeFinite();

  public isSatisfiedBy(candidate: MillisecondsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<MillisecondsValue> {
    return new MillisecondsSpecification();
  }
}

export class SamplesSpecification extends Specification<SamplesValue> {
  private readonly specification = NumberSpecifications.integerRange(
    0,
    Number.MAX_SAFE_INTEGER,
  );

  public isSatisfiedBy(candidate: SamplesValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegativeInteger(): ISpecification<SamplesValue> {
    return new SamplesSpecification();
  }
}
