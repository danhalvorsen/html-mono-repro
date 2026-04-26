import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import {
  MaximumNumberSpecification,
  MinimumNumberSpecification,
  NumberSpecifications,
} from "../common/index.js";
import type { FrequencyHzValue } from "../../types/index.js";

export class FrequencySpecification extends Specification<FrequencyHzValue> {
  private readonly specification = NumberSpecifications.positiveFinite();

  public isSatisfiedBy(candidate: FrequencyHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<FrequencyHzValue> {
    return new FrequencySpecification();
  }

  public static audibleRange(): ISpecification<FrequencyHzValue> {
    return new FrequencyBandSpecification(20, 20_000);
  }

  public static lfoRange(): ISpecification<FrequencyHzValue> {
    return new FrequencyBandSpecification(0.01, 20);
  }

  public static controlRateRange(): ISpecification<FrequencyHzValue> {
    return new FrequencyBandSpecification(0.01, 1_000);
  }

  public static audioOrLfoRange(): ISpecification<FrequencyHzValue> {
    return FrequencySpecification.audibleRange().or(
      FrequencySpecification.lfoRange(),
    );
  }

  public static invalid(): ISpecification<FrequencyHzValue> {
    return new FrequencySpecification().not();
  }
}

export class MinimumFrequencySpecification extends Specification<FrequencyHzValue> {
  private readonly specification: ISpecification<FrequencyHzValue>;

  public constructor(minimumHz: FrequencyHzValue) {
    super();

    this.specification = new FrequencySpecification().and(
      new MinimumNumberSpecification(minimumHz),
    );
  }

  public isSatisfiedBy(candidate: FrequencyHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class MaximumFrequencySpecification extends Specification<FrequencyHzValue> {
  private readonly specification: ISpecification<FrequencyHzValue>;

  public constructor(maximumHz: FrequencyHzValue) {
    super();

    this.specification = new FrequencySpecification().and(
      new MaximumNumberSpecification(maximumHz),
    );
  }

  public isSatisfiedBy(candidate: FrequencyHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class FrequencyBandSpecification extends Specification<FrequencyHzValue> {
  private readonly specification: ISpecification<FrequencyHzValue>;

  public constructor(
    minimumHz: FrequencyHzValue,
    maximumHz: FrequencyHzValue,
  ) {
    super();

    if (!new FrequencySpecification().isSatisfiedBy(minimumHz)) {
      throw new Error("minimumHz must be a positive finite frequency.");
    }

    if (!new FrequencySpecification().isSatisfiedBy(maximumHz)) {
      throw new Error("maximumHz must be a positive finite frequency.");
    }

    if (maximumHz < minimumHz) {
      throw new Error("maximumHz must be greater than or equal to minimumHz.");
    }

    this.specification = new FrequencySpecification()
      .and(new MinimumFrequencySpecification(minimumHz))
      .and(new MaximumFrequencySpecification(maximumHz));
  }

  public isSatisfiedBy(candidate: FrequencyHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}
