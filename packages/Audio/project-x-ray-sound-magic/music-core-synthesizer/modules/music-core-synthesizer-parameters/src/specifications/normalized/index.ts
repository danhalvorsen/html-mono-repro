import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import { NumberSpecifications } from "../common/index.js";
import type {
  BipolarNormalizedValue,
  DryWetMixValue,
  ModulationAmountValue,
  ModulationDepthValue,
  PanValue,
  PercentageValue,
  UnipolarNormalizedValue,
} from "../../types/index.js";

export class UnipolarNormalizedSpecification extends Specification<UnipolarNormalizedValue> {
  private readonly specification = NumberSpecifications.range(0, 1);

  public isSatisfiedBy(candidate: UnipolarNormalizedValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<UnipolarNormalizedValue> {
    return new UnipolarNormalizedSpecification();
  }
}

export class BipolarNormalizedSpecification extends Specification<BipolarNormalizedValue> {
  private readonly specification = NumberSpecifications.range(-1, 1);

  public isSatisfiedBy(candidate: BipolarNormalizedValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static minusOneToOne(): ISpecification<BipolarNormalizedValue> {
    return new BipolarNormalizedSpecification();
  }
}

export class PercentageSpecification extends Specification<PercentageValue> {
  private readonly specification = NumberSpecifications.range(0, 100);

  public isSatisfiedBy(candidate: PercentageValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToHundred(): ISpecification<PercentageValue> {
    return new PercentageSpecification();
  }
}

export class DryWetMixSpecification extends Specification<DryWetMixValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: DryWetMixValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<DryWetMixValue> {
    return new DryWetMixSpecification();
  }
}

export class PanSpecification extends Specification<PanValue> {
  private readonly specification = BipolarNormalizedSpecification.minusOneToOne();

  public isSatisfiedBy(candidate: PanValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static leftToRight(): ISpecification<PanValue> {
    return new PanSpecification();
  }
}

export class ModulationAmountSpecification extends Specification<ModulationAmountValue> {
  private readonly specification = BipolarNormalizedSpecification.minusOneToOne();

  public isSatisfiedBy(candidate: ModulationAmountValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static bipolar(): ISpecification<ModulationAmountValue> {
    return new ModulationAmountSpecification();
  }
}

export class ModulationDepthSpecification extends Specification<ModulationDepthValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: ModulationDepthValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static unipolar(): ISpecification<ModulationDepthValue> {
    return new ModulationDepthSpecification();
  }
}
