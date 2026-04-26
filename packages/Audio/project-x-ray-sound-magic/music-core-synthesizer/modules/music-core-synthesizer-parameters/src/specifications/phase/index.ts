import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import { NumberSpecifications } from "../common/index.js";
import type { PhaseRadiansValue } from "../../types/index.js";

export class PhaseRadiansSpecification extends Specification<PhaseRadiansValue> {
  private readonly specification = NumberSpecifications.finite();

  public isSatisfiedBy(candidate: PhaseRadiansValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<PhaseRadiansValue> {
    return new PhaseRadiansSpecification();
  }

  public static normalizedCycle(): ISpecification<PhaseRadiansValue> {
    return NumberSpecifications.range(0, Math.PI * 2);
  }
}
