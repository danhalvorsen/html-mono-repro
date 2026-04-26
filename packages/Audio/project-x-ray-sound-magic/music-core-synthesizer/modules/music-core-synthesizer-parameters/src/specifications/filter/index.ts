import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import { NumberSpecifications } from "../common/index.js";
import type {
  ResonanceQValue,
  SampleRateHzValue,
} from "../../types/index.js";

export class ResonanceQSpecification extends Specification<ResonanceQValue> {
  private readonly specification = NumberSpecifications.positiveFinite();

  public isSatisfiedBy(candidate: ResonanceQValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<ResonanceQValue> {
    return new ResonanceQSpecification();
  }

  public static safeFilterRange(): ISpecification<ResonanceQValue> {
    return NumberSpecifications.range(0.0001, 40);
  }
}

export class SampleRateHzSpecification extends Specification<SampleRateHzValue> {
  private readonly specification = NumberSpecifications.positiveFinite();

  public isSatisfiedBy(candidate: SampleRateHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<SampleRateHzValue> {
    return new SampleRateHzSpecification();
  }

  public static commonAudioRange(): ISpecification<SampleRateHzValue> {
    return NumberSpecifications.range(8_000, 384_000);
  }
}
