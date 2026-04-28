import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

import {
  EnvelopeDefinitionSpecification,
  type EnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  OscillatorDefinitionSpecification,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  LinearGainSpecification,
  SecondsSpecification,
  UnipolarNormalizedSpecification,
} from "@monorepo/music-core-synthesizer-parameters";

export const VoiceStateKind = {
  Idle: "idle",
  Active: "active",
  Released: "released",
  Disposed: "disposed",
} as const;

export type VoiceStateKind =
  (typeof VoiceStateKind)[keyof typeof VoiceStateKind];

export type VoiceIdValue = string;
export type VoiceLayerIdValue = string;
export type VoiceFrequencyHzValue = number;
export type VoiceGainValue = number;
export type VoiceVelocityValue = number;
export type VoiceSecondsValue = number;

export interface IVoiceLayerDefinition {
  readonly id: VoiceLayerIdValue;
  readonly enabled: boolean;
  readonly gain: VoiceGainValue;
  readonly oscillators: readonly OscillatorDefinition[];
  readonly envelope: EnvelopeDefinition;
}

export interface IVoiceDefinition {
  readonly id: VoiceIdValue;
  readonly outputGain: VoiceGainValue;
  readonly layers: readonly IVoiceLayerDefinition[];
}

export interface IVoiceGateOnRequest {
  readonly timeSeconds: VoiceSecondsValue;
  readonly frequencyHz: VoiceFrequencyHzValue;
  readonly velocity: VoiceVelocityValue;
}

export interface IVoiceGateOffRequest {
  readonly timeSeconds: VoiceSecondsValue;
}

export interface IVoiceStateSnapshot {
  readonly definition: IVoiceDefinition;
  readonly state: VoiceStateKind;
  readonly startedAtSeconds: VoiceSecondsValue | null;
  readonly releasedAtSeconds: VoiceSecondsValue | null;
  readonly frequencyHz: VoiceFrequencyHzValue | null;
  readonly velocity: VoiceVelocityValue;
}

export interface IVoice {
  readonly definition: IVoiceDefinition;

  gateOn(request: IVoiceGateOnRequest): void;

  gateOff(request: IVoiceGateOffRequest): void;

  snapshot(): IVoiceStateSnapshot;

  reset(): void;

  dispose(): void;
}

export interface IVoiceFactory {
  create(definition: IVoiceDefinition): IVoice;
}

export interface IVoiceDefinitionValidator {
  validate(definition: IVoiceDefinition): void;
}

export class VoiceIdSpecification extends Specification<VoiceIdValue> {
  public isSatisfiedBy(candidate: VoiceIdValue): boolean {
    return typeof candidate === "string" && candidate.trim().length > 0;
  }

  public static nonEmpty(): ISpecification<VoiceIdValue> {
    return new VoiceIdSpecification();
  }
}

export class VoiceLayerIdSpecification extends Specification<VoiceLayerIdValue> {
  public isSatisfiedBy(candidate: VoiceLayerIdValue): boolean {
    return typeof candidate === "string" && candidate.trim().length > 0;
  }

  public static nonEmpty(): ISpecification<VoiceLayerIdValue> {
    return new VoiceLayerIdSpecification();
  }
}

export class VoiceGainSpecification extends Specification<VoiceGainValue> {
  private readonly specification = LinearGainSpecification.nonNegative();

  public isSatisfiedBy(candidate: VoiceGainValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<VoiceGainValue> {
    return new VoiceGainSpecification();
  }
}

export class VoiceVelocitySpecification extends Specification<VoiceVelocityValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: VoiceVelocityValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static zeroToOne(): ISpecification<VoiceVelocityValue> {
    return new VoiceVelocitySpecification();
  }
}

export class VoiceSecondsSpecification extends Specification<VoiceSecondsValue> {
  private readonly specification = SecondsSpecification.nonNegative();

  public isSatisfiedBy(candidate: VoiceSecondsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }

  public static nonNegative(): ISpecification<VoiceSecondsValue> {
    return new VoiceSecondsSpecification();
  }
}

export class VoiceFrequencyHzSpecification extends Specification<VoiceFrequencyHzValue> {
  public isSatisfiedBy(candidate: VoiceFrequencyHzValue): boolean {
    return Number.isFinite(candidate) && candidate > 0;
  }

  public static positiveFinite(): ISpecification<VoiceFrequencyHzValue> {
    return new VoiceFrequencyHzSpecification();
  }
}

export class VoiceOscillatorCollectionSpecification
  extends Specification<readonly OscillatorDefinition[]> {
  public isSatisfiedBy(candidate: readonly OscillatorDefinition[]): boolean {
    if (!Array.isArray(candidate) || candidate.length === 0) {
      return false;
    }

    const specification = OscillatorDefinitionSpecification.valid();

    return candidate.every((oscillator) =>
      specification.isSatisfiedBy(oscillator),
    );
  }

  public static oneOrMoreValid(): ISpecification<readonly OscillatorDefinition[]> {
    return new VoiceOscillatorCollectionSpecification();
  }
}

export class VoiceLayerDefinitionSpecification
  extends Specification<IVoiceLayerDefinition> {
  public isSatisfiedBy(candidate: IVoiceLayerDefinition): boolean {
    return VoiceLayerIdSpecification.nonEmpty().isSatisfiedBy(candidate.id)
      && typeof candidate.enabled === "boolean"
      && VoiceGainSpecification.nonNegative().isSatisfiedBy(candidate.gain)
      && VoiceOscillatorCollectionSpecification
        .oneOrMoreValid()
        .isSatisfiedBy(candidate.oscillators)
      && EnvelopeDefinitionSpecification
        .valid()
        .isSatisfiedBy(candidate.envelope);
  }

  public static valid(): ISpecification<IVoiceLayerDefinition> {
    return new VoiceLayerDefinitionSpecification();
  }
}

export class VoiceLayerCollectionSpecification
  extends Specification<readonly IVoiceLayerDefinition[]> {
  public isSatisfiedBy(candidate: readonly IVoiceLayerDefinition[]): boolean {
    if (!Array.isArray(candidate) || candidate.length === 0) {
      return false;
    }

    const ids = new Set<VoiceLayerIdValue>();

    for (const layer of candidate) {
      if (!VoiceLayerDefinitionSpecification.valid().isSatisfiedBy(layer)) {
        return false;
      }

      if (ids.has(layer.id)) {
        return false;
      }

      ids.add(layer.id);
    }

    return candidate.some((layer) => layer.enabled);
  }

  public static valid(): ISpecification<readonly IVoiceLayerDefinition[]> {
    return new VoiceLayerCollectionSpecification();
  }
}

export class VoiceDefinitionSpecification
  extends Specification<IVoiceDefinition> {
  public isSatisfiedBy(candidate: IVoiceDefinition): boolean {
    return VoiceIdSpecification.nonEmpty().isSatisfiedBy(candidate.id)
      && VoiceGainSpecification.nonNegative().isSatisfiedBy(candidate.outputGain)
      && VoiceLayerCollectionSpecification.valid().isSatisfiedBy(candidate.layers);
  }

  public static valid(): ISpecification<IVoiceDefinition> {
    return new VoiceDefinitionSpecification();
  }
}

export class VoiceGateOnRequestSpecification
  extends Specification<IVoiceGateOnRequest> {
  public isSatisfiedBy(candidate: IVoiceGateOnRequest): boolean {
    return VoiceSecondsSpecification.nonNegative().isSatisfiedBy(candidate.timeSeconds)
      && VoiceFrequencyHzSpecification.positiveFinite().isSatisfiedBy(candidate.frequencyHz)
      && VoiceVelocitySpecification.zeroToOne().isSatisfiedBy(candidate.velocity);
  }

  public static valid(): ISpecification<IVoiceGateOnRequest> {
    return new VoiceGateOnRequestSpecification();
  }
}

export class VoiceGateOffRequestSpecification
  extends Specification<IVoiceGateOffRequest> {
  public isSatisfiedBy(candidate: IVoiceGateOffRequest): boolean {
    return VoiceSecondsSpecification.nonNegative().isSatisfiedBy(candidate.timeSeconds);
  }

  public static valid(): ISpecification<IVoiceGateOffRequest> {
    return new VoiceGateOffRequestSpecification();
  }
}
