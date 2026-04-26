import {
  type SecondsValue,
  type UnipolarNormalizedValue,
  SecondsSpecification,
  UnipolarNormalizedSpecification,
} from "@monorepo/music-core-synthesizer-parameters";

import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

export const EnvelopeKind = {
  Adsr: "adsr",
  Ahdsr: "ahdsr",
  Ar: "ar",
  Asr: "asr",
  OneShot: "one-shot",
} as const;

export type EnvelopeKind =
  (typeof EnvelopeKind)[keyof typeof EnvelopeKind];

export const EnvelopeStage = {
  Idle: "idle",
  Attack: "attack",
  Hold: "hold",
  Decay: "decay",
  Sustain: "sustain",
  Release: "release",
  Complete: "complete",
} as const;

export type EnvelopeStage =
  (typeof EnvelopeStage)[keyof typeof EnvelopeStage];

export const EnvelopeCurveKind = {
  Linear: "linear",
  Exponential: "exponential",
  Logarithmic: "logarithmic",
  Instant: "instant",
} as const;

export type EnvelopeCurveKind =
  (typeof EnvelopeCurveKind)[keyof typeof EnvelopeCurveKind];

export type EnvelopeSecondsValue = SecondsValue;
export type EnvelopeLevelValue = UnipolarNormalizedValue;
export type EnvelopeVelocityValue = UnipolarNormalizedValue;

export interface IEnvelopeDefinition {
  readonly kind: EnvelopeKind;
}

export interface IEnvelopeCurveDefinition {
  readonly kind: EnvelopeCurveKind;
}

export interface IAdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly kind: typeof EnvelopeKind.Adsr;
  readonly attackSeconds: EnvelopeSecondsValue;
  readonly decaySeconds: EnvelopeSecondsValue;
  readonly sustainLevel: EnvelopeLevelValue;
  readonly releaseSeconds: EnvelopeSecondsValue;
  readonly attackCurve: IEnvelopeCurveDefinition;
  readonly decayCurve: IEnvelopeCurveDefinition;
  readonly releaseCurve: IEnvelopeCurveDefinition;
}

export interface IAhdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly kind: typeof EnvelopeKind.Ahdsr;
  readonly attackSeconds: EnvelopeSecondsValue;
  readonly holdSeconds: EnvelopeSecondsValue;
  readonly decaySeconds: EnvelopeSecondsValue;
  readonly sustainLevel: EnvelopeLevelValue;
  readonly releaseSeconds: EnvelopeSecondsValue;
  readonly attackCurve: IEnvelopeCurveDefinition;
  readonly decayCurve: IEnvelopeCurveDefinition;
  readonly releaseCurve: IEnvelopeCurveDefinition;
}

export interface IArEnvelopeDefinition extends IEnvelopeDefinition {
  readonly kind: typeof EnvelopeKind.Ar;
  readonly attackSeconds: EnvelopeSecondsValue;
  readonly releaseSeconds: EnvelopeSecondsValue;
  readonly attackCurve: IEnvelopeCurveDefinition;
  readonly releaseCurve: IEnvelopeCurveDefinition;
}

export interface IAsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly kind: typeof EnvelopeKind.Asr;
  readonly attackSeconds: EnvelopeSecondsValue;
  readonly sustainLevel: EnvelopeLevelValue;
  readonly releaseSeconds: EnvelopeSecondsValue;
  readonly attackCurve: IEnvelopeCurveDefinition;
  readonly releaseCurve: IEnvelopeCurveDefinition;
}

export interface IOneShotEnvelopeDefinition extends IEnvelopeDefinition {
  readonly kind: typeof EnvelopeKind.OneShot;
  readonly attackSeconds: EnvelopeSecondsValue;
  readonly decaySeconds: EnvelopeSecondsValue;
  readonly attackCurve: IEnvelopeCurveDefinition;
  readonly decayCurve: IEnvelopeCurveDefinition;
}

export type EnvelopeDefinition =
  | IAdsrEnvelopeDefinition
  | IAhdsrEnvelopeDefinition
  | IArEnvelopeDefinition
  | IAsrEnvelopeDefinition
  | IOneShotEnvelopeDefinition;

export interface IEnvelopeGateOnRequest {
  readonly timeSeconds: EnvelopeSecondsValue;
  readonly velocity: EnvelopeVelocityValue;
}

export interface IEnvelopeGateOffRequest {
  readonly timeSeconds: EnvelopeSecondsValue;
}

export interface IEnvelopeSampleRequest {
  readonly timeSeconds: EnvelopeSecondsValue;
}

export interface IEnvelopeSample {
  readonly timeSeconds: EnvelopeSecondsValue;
  readonly level: EnvelopeLevelValue;
  readonly stage: EnvelopeStage;
  readonly isComplete: boolean;
}

export interface IEnvelopeStateSnapshot {
  readonly stage: EnvelopeStage;
  readonly startedAtSeconds: EnvelopeSecondsValue | null;
  readonly releasedAtSeconds: EnvelopeSecondsValue | null;
  readonly releaseStartLevel: EnvelopeLevelValue;
  readonly currentLevel: EnvelopeLevelValue;
  readonly isGateOpen: boolean;
  readonly isComplete: boolean;
}

export interface IEnvelope {
  readonly definition: EnvelopeDefinition;

  gateOn(request: IEnvelopeGateOnRequest): void;

  gateOff(request: IEnvelopeGateOffRequest): void;

  sample(request: IEnvelopeSampleRequest): IEnvelopeSample;

  snapshot(): IEnvelopeStateSnapshot;

  reset(): void;
}

export interface IEnvelopeFactory {
  create(definition: EnvelopeDefinition): IEnvelope;
}

export class EnvelopeCurveDefinitionSpecification
  extends Specification<IEnvelopeCurveDefinition> {
  public isSatisfiedBy(candidate: IEnvelopeCurveDefinition): boolean {
    return Object.values(EnvelopeCurveKind).includes(candidate.kind);
  }
}

export class EnvelopeSecondsSpecification
  extends Specification<EnvelopeSecondsValue> {
  private readonly specification = SecondsSpecification.nonNegative();

  public isSatisfiedBy(candidate: EnvelopeSecondsValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class EnvelopeLevelSpecification
  extends Specification<EnvelopeLevelValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: EnvelopeLevelValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class EnvelopeVelocitySpecification
  extends Specification<EnvelopeVelocityValue> {
  private readonly specification = UnipolarNormalizedSpecification.zeroToOne();

  public isSatisfiedBy(candidate: EnvelopeVelocityValue): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class AdsrEnvelopeDefinitionSpecification
  extends Specification<IAdsrEnvelopeDefinition> {
  public isSatisfiedBy(candidate: IAdsrEnvelopeDefinition): boolean {
    const seconds = new EnvelopeSecondsSpecification();
    const level = new EnvelopeLevelSpecification();
    const curve = new EnvelopeCurveDefinitionSpecification();

    return candidate.kind === EnvelopeKind.Adsr
      && seconds.isSatisfiedBy(candidate.attackSeconds)
      && seconds.isSatisfiedBy(candidate.decaySeconds)
      && seconds.isSatisfiedBy(candidate.releaseSeconds)
      && level.isSatisfiedBy(candidate.sustainLevel)
      && curve.isSatisfiedBy(candidate.attackCurve)
      && curve.isSatisfiedBy(candidate.decayCurve)
      && curve.isSatisfiedBy(candidate.releaseCurve);
  }
}

export class AhdsrEnvelopeDefinitionSpecification
  extends Specification<IAhdsrEnvelopeDefinition> {
  public isSatisfiedBy(candidate: IAhdsrEnvelopeDefinition): boolean {
    const seconds = new EnvelopeSecondsSpecification();
    const level = new EnvelopeLevelSpecification();
    const curve = new EnvelopeCurveDefinitionSpecification();

    return candidate.kind === EnvelopeKind.Ahdsr
      && seconds.isSatisfiedBy(candidate.attackSeconds)
      && seconds.isSatisfiedBy(candidate.holdSeconds)
      && seconds.isSatisfiedBy(candidate.decaySeconds)
      && seconds.isSatisfiedBy(candidate.releaseSeconds)
      && level.isSatisfiedBy(candidate.sustainLevel)
      && curve.isSatisfiedBy(candidate.attackCurve)
      && curve.isSatisfiedBy(candidate.decayCurve)
      && curve.isSatisfiedBy(candidate.releaseCurve);
  }
}

export class ArEnvelopeDefinitionSpecification
  extends Specification<IArEnvelopeDefinition> {
  public isSatisfiedBy(candidate: IArEnvelopeDefinition): boolean {
    const seconds = new EnvelopeSecondsSpecification();
    const curve = new EnvelopeCurveDefinitionSpecification();

    return candidate.kind === EnvelopeKind.Ar
      && seconds.isSatisfiedBy(candidate.attackSeconds)
      && seconds.isSatisfiedBy(candidate.releaseSeconds)
      && curve.isSatisfiedBy(candidate.attackCurve)
      && curve.isSatisfiedBy(candidate.releaseCurve);
  }
}

export class AsrEnvelopeDefinitionSpecification
  extends Specification<IAsrEnvelopeDefinition> {
  public isSatisfiedBy(candidate: IAsrEnvelopeDefinition): boolean {
    const seconds = new EnvelopeSecondsSpecification();
    const level = new EnvelopeLevelSpecification();
    const curve = new EnvelopeCurveDefinitionSpecification();

    return candidate.kind === EnvelopeKind.Asr
      && seconds.isSatisfiedBy(candidate.attackSeconds)
      && seconds.isSatisfiedBy(candidate.releaseSeconds)
      && level.isSatisfiedBy(candidate.sustainLevel)
      && curve.isSatisfiedBy(candidate.attackCurve)
      && curve.isSatisfiedBy(candidate.releaseCurve);
  }
}

export class OneShotEnvelopeDefinitionSpecification
  extends Specification<IOneShotEnvelopeDefinition> {
  public isSatisfiedBy(candidate: IOneShotEnvelopeDefinition): boolean {
    const seconds = new EnvelopeSecondsSpecification();
    const curve = new EnvelopeCurveDefinitionSpecification();

    return candidate.kind === EnvelopeKind.OneShot
      && seconds.isSatisfiedBy(candidate.attackSeconds)
      && seconds.isSatisfiedBy(candidate.decaySeconds)
      && curve.isSatisfiedBy(candidate.attackCurve)
      && curve.isSatisfiedBy(candidate.decayCurve);
  }
}

export class EnvelopeDefinitionSpecification
  extends Specification<EnvelopeDefinition> {
  public isSatisfiedBy(candidate: EnvelopeDefinition): boolean {
    switch (candidate.kind) {
      case EnvelopeKind.Adsr:
        return new AdsrEnvelopeDefinitionSpecification().isSatisfiedBy(candidate);

      case EnvelopeKind.Ahdsr:
        return new AhdsrEnvelopeDefinitionSpecification().isSatisfiedBy(candidate);

      case EnvelopeKind.Ar:
        return new ArEnvelopeDefinitionSpecification().isSatisfiedBy(candidate);

      case EnvelopeKind.Asr:
        return new AsrEnvelopeDefinitionSpecification().isSatisfiedBy(candidate);

      case EnvelopeKind.OneShot:
        return new OneShotEnvelopeDefinitionSpecification().isSatisfiedBy(candidate);
    }
  }

  public static valid(): ISpecification<EnvelopeDefinition> {
    return new EnvelopeDefinitionSpecification();
  }
}

export interface IEnvelopeDefinitionValidator {
  validate(definition: EnvelopeDefinition): void;
}

export class EnvelopeDefinitionValidator implements IEnvelopeDefinitionValidator {
  public constructor(
    private readonly specification: ISpecification<EnvelopeDefinition>,
  ) {}

  public static createDefault(): EnvelopeDefinitionValidator {
    return new EnvelopeDefinitionValidator(EnvelopeDefinitionSpecification.valid());
  }

  public validate(definition: EnvelopeDefinition): void {
    if (!this.specification.isSatisfiedBy(definition)) {
      throw new Error(`Envelope definition is invalid for kind '${definition.kind}'.`);
    }
  }
}
