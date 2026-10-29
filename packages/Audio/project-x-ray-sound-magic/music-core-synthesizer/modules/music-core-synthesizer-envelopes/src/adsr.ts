import type {
  IEnvelopeDefinition,
  Seconds,
  Normalized,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Discriminator
============================================================================ */

export const ADSR_ENVELOPE = "adsr";

/* ============================================================================
   Definition
============================================================================ */

export interface IAdsrEnvelopeDefinition extends IEnvelopeDefinition {
  readonly type: typeof ADSR_ENVELOPE;

  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

/* ============================================================================
   Factory (safe construction)
============================================================================ */

export class AdsrEnvelope {
  public static create(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): IAdsrEnvelopeDefinition {
    this.validate(input);

    return {
      type: ADSR_ENVELOPE,
      attackSeconds: input.attackSeconds,
      decaySeconds: input.decaySeconds,
      sustainLevel: input.sustainLevel,
      releaseSeconds: input.releaseSeconds,
    };
  }

  private static validate(input: {
    readonly attackSeconds: Seconds;
    readonly decaySeconds: Seconds;
    readonly sustainLevel: Normalized;
    readonly releaseSeconds: Seconds;
  }): void {
    if (input.attackSeconds < 0) throw new Error("attackSeconds >= 0");
    if (input.decaySeconds < 0) throw new Error("decaySeconds >= 0");
    if (input.releaseSeconds < 0) throw new Error("releaseSeconds >= 0");

    if (input.sustainLevel < 0 || input.sustainLevel > 1) {
      throw new Error("sustainLevel must be 0..1");
    }
  }
}
