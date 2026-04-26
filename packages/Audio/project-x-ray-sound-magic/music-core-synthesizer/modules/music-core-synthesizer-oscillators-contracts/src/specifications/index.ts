import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import {
  DetuneCentsSpecification,
  FrequencySpecification,
  LinearGainSpecification,
  PhaseRadiansSpecification,
  SampleRateHzSpecification,
  SecondsSpecification,
  UnipolarNormalizedSpecification,
} from "@monorepo/music-core-synthesizer-parameters";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type OscillatorKind as OscillatorKindValue,
  type OscillatorWaveformKind as OscillatorWaveformKindValue,
} from "../kinds/index.js";
import type {
  AudioSampleValue,
  DetuneCentsValue,
  FrequencyHzValue,
  OscillatorGainValue,
  OscillatorVelocityValue,
  PhaseRadiansValue,
  PulseWidthValue,
  SampleRateHzValue,
  SecondsValue,
} from "../types/index.js";
import type {
  IBasicOscillatorDefinition,
  IPulseOscillatorDefinition,
  ISampleOscillatorDefinition,
  IWavetableOscillatorDefinition,
  OscillatorDefinition,
} from "../definitions/index.js";

export class OscillatorKindSpecification extends Specification<OscillatorKindValue> {
  public isSatisfiedBy(candidate: OscillatorKindValue): boolean {
    return Object.values(OscillatorKind).includes(candidate);
  }

  public static valid(): ISpecification<OscillatorKindValue> {
    return new OscillatorKindSpecification();
  }
}

export class OscillatorWaveformKindSpecification extends Specification<OscillatorWaveformKindValue> {
  public isSatisfiedBy(candidate: OscillatorWaveformKindValue): boolean {
    return Object.values(OscillatorWaveformKind).includes(candidate);
  }

  public static valid(): ISpecification<OscillatorWaveformKindValue> {
    return new OscillatorWaveformKindSpecification();
  }
}

export class OscillatorFrequencySpecification extends Specification<FrequencyHzValue> {
  private readonly specification = FrequencySpecification.positiveFinite();

  public isSatisfiedBy(candidate: FrequencyHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<FrequencyHzValue> {
    return new OscillatorFrequencySpecification();
  }
}

export class OscillatorDetuneSpecification extends Specification<DetuneCentsValue> {
  private readonly specification = DetuneCentsSpecification.finite();

  public isSatisfiedBy(candidate: DetuneCentsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<DetuneCentsValue> {
    return new OscillatorDetuneSpecification();
  }
}

export class OscillatorPhaseSpecification extends Specification<PhaseRadiansValue> {
  private readonly specification = PhaseRadiansSpecification.finite();

  public isSatisfiedBy(candidate: PhaseRadiansValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static finite(): ISpecification<PhaseRadiansValue> {
    return new OscillatorPhaseSpecification();
  }
}

export class OscillatorGainSpecification extends Specification<OscillatorGainValue> {
  private readonly specification = LinearGainSpecification.nonNegative();

  public isSatisfiedBy(candidate: OscillatorGainValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<OscillatorGainValue> {
    return new OscillatorGainSpecification();
  }
}

export class OscillatorVelocitySpecification extends Specification<OscillatorVelocityValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: OscillatorVelocityValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<OscillatorVelocityValue> {
    return new OscillatorVelocitySpecification();
  }
}

export class PulseWidthSpecification extends Specification<PulseWidthValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: PulseWidthValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<PulseWidthValue> {
    return new PulseWidthSpecification();
  }
}

export class OscillatorSampleRateSpecification extends Specification<SampleRateHzValue> {
  private readonly specification = SampleRateHzSpecification.positiveFinite();

  public isSatisfiedBy(candidate: SampleRateHzValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static positiveFinite(): ISpecification<SampleRateHzValue> {
    return new OscillatorSampleRateSpecification();
  }
}

export class OscillatorSecondsSpecification extends Specification<SecondsValue> {
  private readonly specification = SecondsSpecification.nonNegative();

  public isSatisfiedBy(candidate: SecondsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<SecondsValue> {
    return new OscillatorSecondsSpecification();
  }
}

export class OscillatorAudioSampleSpecification extends Specification<AudioSampleValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne()
    .or(UnipolarNormalizedSpecification.zeroToOne().not());

  public isSatisfiedBy(candidate: AudioSampleValue): boolean {
    return Number.isFinite(candidate) && candidate >= -1 && candidate <= 1;
  }

  public static minusOneToOne(): ISpecification<AudioSampleValue> {
    return new OscillatorAudioSampleSpecification();
  }
}

abstract class OscillatorDefinitionSpecificationBase<TDefinition extends OscillatorDefinition>
  extends Specification<TDefinition> {
  protected isBaseValid(candidate: TDefinition): boolean {
    return OscillatorGainSpecification.nonNegative().isSatisfiedBy(candidate.gain);
  }

  protected hasNonEmptyId(value: string): boolean {
    return value.trim().length > 0;
  }
}

export class BasicOscillatorDefinitionSpecification
  extends OscillatorDefinitionSpecificationBase<IBasicOscillatorDefinition> {
  public isSatisfiedBy(candidate: IBasicOscillatorDefinition): boolean {
    return candidate.kind === OscillatorKind.Basic
      && this.isBaseValid(candidate)
      && OscillatorWaveformKindSpecification.valid().isSatisfiedBy(candidate.waveform)
      && OscillatorFrequencySpecification.positiveFinite().isSatisfiedBy(candidate.frequencyHz)
      && OscillatorDetuneSpecification.finite().isSatisfiedBy(candidate.detuneCents)
      && OscillatorPhaseSpecification.finite().isSatisfiedBy(candidate.phaseRadians);
  }
}

export class PulseOscillatorDefinitionSpecification
  extends OscillatorDefinitionSpecificationBase<IPulseOscillatorDefinition> {
  public isSatisfiedBy(candidate: IPulseOscillatorDefinition): boolean {
    return candidate.kind === OscillatorKind.Pulse
      && this.isBaseValid(candidate)
      && OscillatorFrequencySpecification.positiveFinite().isSatisfiedBy(candidate.frequencyHz)
      && OscillatorDetuneSpecification.finite().isSatisfiedBy(candidate.detuneCents)
      && OscillatorPhaseSpecification.finite().isSatisfiedBy(candidate.phaseRadians)
      && PulseWidthSpecification.zeroToOne().isSatisfiedBy(candidate.pulseWidth);
  }
}

export class WavetableOscillatorDefinitionSpecification
  extends OscillatorDefinitionSpecificationBase<IWavetableOscillatorDefinition> {
  public isSatisfiedBy(candidate: IWavetableOscillatorDefinition): boolean {
    return candidate.kind === OscillatorKind.Wavetable
      && this.isBaseValid(candidate)
      && this.hasNonEmptyId(candidate.tableId)
      && OscillatorFrequencySpecification.positiveFinite().isSatisfiedBy(candidate.frequencyHz)
      && OscillatorDetuneSpecification.finite().isSatisfiedBy(candidate.detuneCents)
      && OscillatorPhaseSpecification.finite().isSatisfiedBy(candidate.phaseRadians);
  }
}

export class SampleOscillatorDefinitionSpecification
  extends OscillatorDefinitionSpecificationBase<ISampleOscillatorDefinition> {
  public isSatisfiedBy(candidate: ISampleOscillatorDefinition): boolean {
    return candidate.kind === OscillatorKind.Sample
      && this.isBaseValid(candidate)
      && this.hasNonEmptyId(candidate.sampleId)
      && OscillatorFrequencySpecification.positiveFinite().isSatisfiedBy(candidate.rootFrequencyHz)
      && OscillatorFrequencySpecification.positiveFinite().isSatisfiedBy(candidate.playbackFrequencyHz);
  }
}

export class OscillatorDefinitionSpecification extends Specification<OscillatorDefinition> {
  public isSatisfiedBy(candidate: OscillatorDefinition): boolean {
    switch (candidate.kind) {
      case OscillatorKind.Basic:
        return new BasicOscillatorDefinitionSpecification().isSatisfiedBy(candidate);

      case OscillatorKind.Pulse:
        return new PulseOscillatorDefinitionSpecification().isSatisfiedBy(candidate);

      case OscillatorKind.Wavetable:
        return new WavetableOscillatorDefinitionSpecification().isSatisfiedBy(candidate);

      case OscillatorKind.Sample:
        return new SampleOscillatorDefinitionSpecification().isSatisfiedBy(candidate);
    }

    return false;
  }

  public static valid(): ISpecification<OscillatorDefinition> {
    return new OscillatorDefinitionSpecification();
  }
}
