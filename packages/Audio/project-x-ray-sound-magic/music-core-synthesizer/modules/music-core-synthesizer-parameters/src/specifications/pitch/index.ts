import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import { NumberSpecifications } from "../common/index.js";
import type {
  DetuneCentsValue,
  FrequencyRatioValue,
  OctaveValue,
  RatioValue,
  SemitoneValue,
} from "../../types/index.js";

export class DetuneCentsSpecification extends Specification<DetuneCentsValue> {
  private readonly specification = NumberSpecifications.finite();

  public isSatisfiedBy(candidate: DetuneCentsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<DetuneCentsValue> {
    return new DetuneCentsSpecification();
  }

  public static standardOctaveRange(): ISpecification<DetuneCentsValue> {
    return NumberSpecifications.range(-1_200, 1_200);
  }
}

export class SemitoneSpecification extends Specification<SemitoneValue> {
  private readonly specification = NumberSpecifications.finite();

  public isSatisfiedBy(candidate: SemitoneValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<SemitoneValue> {
    return new SemitoneSpecification();
  }
}

export class OctaveSpecification extends Specification<OctaveValue> {
  private readonly specification = NumberSpecifications.finite();

  public isSatisfiedBy(candidate: OctaveValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<OctaveValue> {
    return new OctaveSpecification();
  }
}

export class RatioSpecification extends Specification<RatioValue> {
  private readonly specification = NumberSpecifications.positiveFinite();

  public isSatisfiedBy(candidate: RatioValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<RatioValue> {
    return new RatioSpecification();
  }
}

export class FrequencyRatioSpecification extends Specification<FrequencyRatioValue> {
  private readonly specification = NumberSpecifications.positiveFinite();

  public isSatisfiedBy(candidate: FrequencyRatioValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<FrequencyRatioValue> {
    return new FrequencyRatioSpecification();
  }
}
