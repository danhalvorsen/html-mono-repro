import {
  EnvelopeCurveKind,
  EnvelopeKind,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

export class AdsrEnvelopeDefinitionTestFactory {
  public static createDefault(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.05,
      decaySeconds: 0.2,
      sustainLevel: 0.65,
      releaseSeconds: 0.4,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Exponential },
      releaseCurve: { kind: EnvelopeCurveKind.Exponential },
    };
  }

  public static createFast(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.02,
      decaySeconds: 0.12,
      sustainLevel: 0.7,
      releaseSeconds: 0.2,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Exponential },
      releaseCurve: { kind: EnvelopeCurveKind.Exponential },
    };
  }

  public static createSlow(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.15,
      decaySeconds: 0.3,
      sustainLevel: 0.5,
      releaseSeconds: 0.6,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Exponential },
      releaseCurve: { kind: EnvelopeCurveKind.Exponential },
    };
  }
}
