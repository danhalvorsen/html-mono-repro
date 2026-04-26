import {
  DecibelsSpecification,
  DetuneCentsSpecification,
  DryWetMixSpecification,
  FrequencyRatioSpecification,
  FrequencySpecification,
  LinearGainSpecification,
  MillisecondsSpecification,
  ModulationAmountSpecification,
  ModulationDepthSpecification,
  PanSpecification,
  PercentageSpecification,
  PhaseRadiansSpecification,
  ResonanceQSpecification,
  SampleRateHzSpecification,
  SamplesSpecification,
  SecondsSpecification,
  UnipolarNormalizedSpecification,
  BipolarNormalizedSpecification,
} from "../specifications/index.js";
import type {
  BipolarNormalizedValue,
  DecibelsValue,
  DetuneCentsValue,
  DryWetMixValue,
  FrequencyHzValue,
  FrequencyRatioValue,
  LinearGainValue,
  MillisecondsValue,
  ModulationAmountValue,
  ModulationDepthValue,
  PanValue,
  PercentageValue,
  PhaseRadiansValue,
  ResonanceQValue,
  SampleRateHzValue,
  SamplesValue,
  SecondsValue,
  UnipolarNormalizedValue,
} from "../types/index.js";

export class FrequencyHz {
  private constructor(private readonly innerValue: FrequencyHzValue) {}

  public static create(value: FrequencyHzValue): FrequencyHz {
    if (!FrequencySpecification.positiveFinite().isSatisfiedBy(value)) {
      throw new Error(`frequencyHz must be finite and greater than 0. Actual value: ${String(value)}.`);
    }

    return new FrequencyHz(value);
  }

  public value(): FrequencyHzValue {
    return this.innerValue;
  }
}

export class UnipolarNormalized {
  private constructor(private readonly innerValue: UnipolarNormalizedValue) {}

  public static create(value: UnipolarNormalizedValue): UnipolarNormalized {
    if (!UnipolarNormalizedSpecification.zeroToOne().isSatisfiedBy(value)) {
      throw new Error(`unipolarNormalized must be between 0 and 1. Actual value: ${String(value)}.`);
    }

    return new UnipolarNormalized(value);
  }

  public value(): UnipolarNormalizedValue {
    return this.innerValue;
  }
}

export class BipolarNormalized {
  private constructor(private readonly innerValue: BipolarNormalizedValue) {}

  public static create(value: BipolarNormalizedValue): BipolarNormalized {
    if (!BipolarNormalizedSpecification.minusOneToOne().isSatisfiedBy(value)) {
      throw new Error(`bipolarNormalized must be between -1 and 1. Actual value: ${String(value)}.`);
    }

    return new BipolarNormalized(value);
  }

  public value(): BipolarNormalizedValue {
    return this.innerValue;
  }
}

export class Percentage {
  private constructor(private readonly innerValue: PercentageValue) {}

  public static create(value: PercentageValue): Percentage {
    if (!PercentageSpecification.zeroToHundred().isSatisfiedBy(value)) {
      throw new Error(`percentage must be between 0 and 100. Actual value: ${String(value)}.`);
    }

    return new Percentage(value);
  }

  public value(): PercentageValue {
    return this.innerValue;
  }
}

export class ParameterSeconds {
  private constructor(private readonly innerValue: SecondsValue) {}

  public static create(value: SecondsValue): ParameterSeconds {
    if (!SecondsSpecification.nonNegative().isSatisfiedBy(value)) {
      throw new Error(`seconds must be finite and greater than or equal to 0. Actual value: ${String(value)}.`);
    }

    return new ParameterSeconds(value);
  }

  public value(): SecondsValue {
    return this.innerValue;
  }
}

export class ParameterMilliseconds {
  private constructor(private readonly innerValue: MillisecondsValue) {}

  public static create(value: MillisecondsValue): ParameterMilliseconds {
    if (!MillisecondsSpecification.nonNegative().isSatisfiedBy(value)) {
      throw new Error(`milliseconds must be finite and greater than or equal to 0. Actual value: ${String(value)}.`);
    }

    return new ParameterMilliseconds(value);
  }

  public value(): MillisecondsValue {
    return this.innerValue;
  }
}

export class ParameterSamples {
  private constructor(private readonly innerValue: SamplesValue) {}

  public static create(value: SamplesValue): ParameterSamples {
    if (!SamplesSpecification.nonNegativeInteger().isSatisfiedBy(value)) {
      throw new Error(`samples must be a non-negative safe integer. Actual value: ${String(value)}.`);
    }

    return new ParameterSamples(value);
  }

  public value(): SamplesValue {
    return this.innerValue;
  }
}

export class DetuneCents {
  private constructor(private readonly innerValue: DetuneCentsValue) {}

  public static create(value: DetuneCentsValue): DetuneCents {
    if (!DetuneCentsSpecification.finite().isSatisfiedBy(value)) {
      throw new Error(`detuneCents must be finite. Actual value: ${String(value)}.`);
    }

    return new DetuneCents(value);
  }

  public value(): DetuneCentsValue {
    return this.innerValue;
  }
}

export class Decibels {
  private constructor(private readonly innerValue: DecibelsValue) {}

  public static create(value: DecibelsValue): Decibels {
    if (!DecibelsSpecification.finite().isSatisfiedBy(value)) {
      throw new Error(`decibels must be finite. Actual value: ${String(value)}.`);
    }

    return new Decibels(value);
  }

  public value(): DecibelsValue {
    return this.innerValue;
  }
}

export class LinearGain {
  private constructor(private readonly innerValue: LinearGainValue) {}

  public static create(value: LinearGainValue): LinearGain {
    if (!LinearGainSpecification.nonNegative().isSatisfiedBy(value)) {
      throw new Error(`linearGain must be finite and greater than or equal to 0. Actual value: ${String(value)}.`);
    }

    return new LinearGain(value);
  }

  public value(): LinearGainValue {
    return this.innerValue;
  }
}

export class FrequencyRatio {
  private constructor(private readonly innerValue: FrequencyRatioValue) {}

  public static create(value: FrequencyRatioValue): FrequencyRatio {
    if (!FrequencyRatioSpecification.positiveFinite().isSatisfiedBy(value)) {
      throw new Error(`frequencyRatio must be finite and greater than 0. Actual value: ${String(value)}.`);
    }

    return new FrequencyRatio(value);
  }

  public value(): FrequencyRatioValue {
    return this.innerValue;
  }
}

export class PhaseRadians {
  private constructor(private readonly innerValue: PhaseRadiansValue) {}

  public static create(value: PhaseRadiansValue): PhaseRadians {
    if (!PhaseRadiansSpecification.finite().isSatisfiedBy(value)) {
      throw new Error(`phaseRadians must be finite. Actual value: ${String(value)}.`);
    }

    return new PhaseRadians(value);
  }

  public value(): PhaseRadiansValue {
    return this.innerValue;
  }
}

export class ResonanceQ {
  private constructor(private readonly innerValue: ResonanceQValue) {}

  public static create(value: ResonanceQValue): ResonanceQ {
    if (!ResonanceQSpecification.positiveFinite().isSatisfiedBy(value)) {
      throw new Error(`resonanceQ must be finite and greater than 0. Actual value: ${String(value)}.`);
    }

    return new ResonanceQ(value);
  }

  public value(): ResonanceQValue {
    return this.innerValue;
  }
}

export class SampleRateHz {
  private constructor(private readonly innerValue: SampleRateHzValue) {}

  public static create(value: SampleRateHzValue): SampleRateHz {
    if (!SampleRateHzSpecification.positiveFinite().isSatisfiedBy(value)) {
      throw new Error(`sampleRateHz must be finite and greater than 0. Actual value: ${String(value)}.`);
    }

    return new SampleRateHz(value);
  }

  public value(): SampleRateHzValue {
    return this.innerValue;
  }
}

export class DryWetMix {
  private constructor(private readonly innerValue: DryWetMixValue) {}

  public static create(value: DryWetMixValue): DryWetMix {
    if (!DryWetMixSpecification.zeroToOne().isSatisfiedBy(value)) {
      throw new Error(`dryWetMix must be between 0 and 1. Actual value: ${String(value)}.`);
    }

    return new DryWetMix(value);
  }

  public value(): DryWetMixValue {
    return this.innerValue;
  }
}

export class Pan {
  private constructor(private readonly innerValue: PanValue) {}

  public static create(value: PanValue): Pan {
    if (!PanSpecification.leftToRight().isSatisfiedBy(value)) {
      throw new Error(`pan must be between -1 and 1. Actual value: ${String(value)}.`);
    }

    return new Pan(value);
  }

  public value(): PanValue {
    return this.innerValue;
  }
}

export class ModulationAmount {
  private constructor(private readonly innerValue: ModulationAmountValue) {}

  public static create(value: ModulationAmountValue): ModulationAmount {
    if (!ModulationAmountSpecification.bipolar().isSatisfiedBy(value)) {
      throw new Error(`modulationAmount must be between -1 and 1. Actual value: ${String(value)}.`);
    }

    return new ModulationAmount(value);
  }

  public value(): ModulationAmountValue {
    return this.innerValue;
  }
}

export class ModulationDepth {
  private constructor(private readonly innerValue: ModulationDepthValue) {}

  public static create(value: ModulationDepthValue): ModulationDepth {
    if (!ModulationDepthSpecification.unipolar().isSatisfiedBy(value)) {
      throw new Error(`modulationDepth must be between 0 and 1. Actual value: ${String(value)}.`);
    }

    return new ModulationDepth(value);
  }

  public value(): ModulationDepthValue {
    return this.innerValue;
  }
}
