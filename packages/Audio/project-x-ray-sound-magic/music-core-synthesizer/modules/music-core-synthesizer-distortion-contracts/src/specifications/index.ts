import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import {
  BipolarNormalizedSpecification,
  LinearGainSpecification,
  NumberSpecifications,
  SampleRateHzSpecification,
  UnipolarNormalizedSpecification,
} from "@monorepo/music-core-synthesizer-parameters";

import {
  DistortionCurveKind,
  DistortionKind,
  type DistortionCurveKind as DistortionCurveKindValue,
  type DistortionKind as DistortionKindValue,
} from "../kinds/index.js";
import type {
  BitDepthValue,
  DistortionAmountValue,
  DistortionAudioSampleValue,
  DistortionInputGainValue,
  DistortionMixValue,
  DistortionOutputGainValue,
  DistortionSampleRateHzValue,
  DistortionThresholdValue,
  SampleRateReductionValue,
} from "../types/index.js";
import type {
  DistortionDefinition,
  IBitCrushDistortionDefinition,
  IBypassDistortionDefinition,
  IFoldbackDistortionDefinition,
  IHardClipDistortionDefinition,
  ISoftClipDistortionDefinition,
  ITanhDistortionDefinition,
} from "../definitions/index.js";

export class DistortionKindSpecification extends Specification<string> {
  public isSatisfiedBy(candidate: string): boolean {
    return Object.values(DistortionKind).includes(candidate as DistortionKindValue);
  }
}

export class DistortionCurveKindSpecification extends Specification<string> {
  public isSatisfiedBy(candidate: string): boolean {
    return Object.values(DistortionCurveKind).includes(candidate as DistortionCurveKindValue);
  }
}

export class DistortionAmountSpecification extends Specification<DistortionAmountValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: DistortionAmountValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<DistortionAmountValue> {
    return new DistortionAmountSpecification();
  }
}

export class DistortionMixSpecification extends Specification<DistortionMixValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: DistortionMixValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<DistortionMixValue> {
    return new DistortionMixSpecification();
  }
}

export class DistortionInputGainSpecification extends Specification<DistortionInputGainValue> {
  private readonly specification = LinearGainSpecification.nonNegative();

  public isSatisfiedBy(candidate: DistortionInputGainValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<DistortionInputGainValue> {
    return new DistortionInputGainSpecification();
  }
}

export class DistortionOutputGainSpecification extends Specification<DistortionOutputGainValue> {
  private readonly specification = LinearGainSpecification.nonNegative();

  public isSatisfiedBy(candidate: DistortionOutputGainValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<DistortionOutputGainValue> {
    return new DistortionOutputGainSpecification();
  }
}

export class DistortionThresholdSpecification extends Specification<DistortionThresholdValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: DistortionThresholdValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<DistortionThresholdValue> {
    return new DistortionThresholdSpecification();
  }
}

export class DistortionAudioSampleSpecification extends Specification<DistortionAudioSampleValue> {
  private readonly specification = BipolarNormalizedSpecification.minusOneToOne();

  public isSatisfiedBy(candidate: DistortionAudioSampleValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static minusOneToOne(): ISpecification<DistortionAudioSampleValue> {
    return new DistortionAudioSampleSpecification();
  }
}

export class DistortionSampleRateHzSpecification extends Specification<DistortionSampleRateHzValue> {
  private readonly specification = SampleRateHzSpecification.positiveFinite();

  public isSatisfiedBy(candidate: DistortionSampleRateHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<DistortionSampleRateHzValue> {
    return new DistortionSampleRateHzSpecification();
  }
}

export class BitDepthSpecification extends Specification<BitDepthValue> {
  private readonly specification = NumberSpecifications.integerRange(1, 32);

  public isSatisfiedBy(candidate: BitDepthValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static standardRange(): ISpecification<BitDepthValue> {
    return new BitDepthSpecification();
  }
}

export class SampleRateReductionSpecification extends Specification<SampleRateReductionValue> {
  private readonly specification = NumberSpecifications.integerRange(1, 1024);

  public isSatisfiedBy(candidate: SampleRateReductionValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static standardRange(): ISpecification<SampleRateReductionValue> {
    return new SampleRateReductionSpecification();
  }
}

abstract class DistortionDefinitionSpecificationBase<TDefinition extends DistortionDefinition>
  extends Specification<TDefinition> {
  protected isBaseValid(candidate: TDefinition): boolean {
    return DistortionInputGainSpecification.nonNegative().isSatisfiedBy(candidate.inputGain)
      && DistortionOutputGainSpecification.nonNegative().isSatisfiedBy(candidate.outputGain)
      && DistortionMixSpecification.zeroToOne().isSatisfiedBy(candidate.mix);
  }
}

export class BypassDistortionDefinitionSpecification
  extends DistortionDefinitionSpecificationBase<IBypassDistortionDefinition> {
  public isSatisfiedBy(candidate: IBypassDistortionDefinition): boolean {
    return candidate.kind === DistortionKind.Bypass
      && this.isBaseValid(candidate);
  }
}

export class HardClipDistortionDefinitionSpecification
  extends DistortionDefinitionSpecificationBase<IHardClipDistortionDefinition> {
  public isSatisfiedBy(candidate: IHardClipDistortionDefinition): boolean {
    return candidate.kind === DistortionKind.HardClip
      && this.isBaseValid(candidate)
      && DistortionThresholdSpecification.zeroToOne().isSatisfiedBy(candidate.threshold);
  }
}

export class SoftClipDistortionDefinitionSpecification
  extends DistortionDefinitionSpecificationBase<ISoftClipDistortionDefinition> {
  public isSatisfiedBy(candidate: ISoftClipDistortionDefinition): boolean {
    return candidate.kind === DistortionKind.SoftClip
      && this.isBaseValid(candidate)
      && DistortionAmountSpecification.zeroToOne().isSatisfiedBy(candidate.amount)
      && new DistortionCurveKindSpecification().isSatisfiedBy(candidate.curve);
  }
}

export class TanhDistortionDefinitionSpecification
  extends DistortionDefinitionSpecificationBase<ITanhDistortionDefinition> {
  public isSatisfiedBy(candidate: ITanhDistortionDefinition): boolean {
    return candidate.kind === DistortionKind.Tanh
      && this.isBaseValid(candidate)
      && DistortionAmountSpecification.zeroToOne().isSatisfiedBy(candidate.amount);
  }
}

export class FoldbackDistortionDefinitionSpecification
  extends DistortionDefinitionSpecificationBase<IFoldbackDistortionDefinition> {
  public isSatisfiedBy(candidate: IFoldbackDistortionDefinition): boolean {
    return candidate.kind === DistortionKind.Foldback
      && this.isBaseValid(candidate)
      && DistortionThresholdSpecification.zeroToOne().isSatisfiedBy(candidate.threshold);
  }
}

export class BitCrushDistortionDefinitionSpecification
  extends DistortionDefinitionSpecificationBase<IBitCrushDistortionDefinition> {
  public isSatisfiedBy(candidate: IBitCrushDistortionDefinition): boolean {
    return candidate.kind === DistortionKind.BitCrush
      && this.isBaseValid(candidate)
      && BitDepthSpecification.standardRange().isSatisfiedBy(candidate.bitDepth)
      && SampleRateReductionSpecification.standardRange().isSatisfiedBy(candidate.sampleRateReduction);
  }
}

export class DistortionDefinitionSpecification
  extends Specification<DistortionDefinition> {
  public isSatisfiedBy(candidate: DistortionDefinition): boolean {
    switch (candidate.kind) {
      case DistortionKind.Bypass:
        return new BypassDistortionDefinitionSpecification().isSatisfiedBy(candidate);

      case DistortionKind.HardClip:
        return new HardClipDistortionDefinitionSpecification().isSatisfiedBy(candidate);

      case DistortionKind.SoftClip:
        return new SoftClipDistortionDefinitionSpecification().isSatisfiedBy(candidate);

      case DistortionKind.Tanh:
        return new TanhDistortionDefinitionSpecification().isSatisfiedBy(candidate);

      case DistortionKind.Foldback:
        return new FoldbackDistortionDefinitionSpecification().isSatisfiedBy(candidate);

      case DistortionKind.BitCrush:
        return new BitCrushDistortionDefinitionSpecification().isSatisfiedBy(candidate);

      default:
        return false;
    }
  }

  public static valid(): ISpecification<DistortionDefinition> {
    return new DistortionDefinitionSpecification();
  }
}
