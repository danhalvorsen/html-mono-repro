import type { EnvelopeADSR } from "../value-objects/EnvelopeADSR.js";
import type { FilterSettings } from "../value-objects/FilterSettings.js";

export type WebAudioSynthConfigurationArgs = {
  readonly envelope: EnvelopeADSR;
  readonly filter: FilterSettings;
  readonly filterEnvelope?: EnvelopeADSR;
  readonly noteLengthSeconds?: number;
  readonly detuneCents?: number;
  readonly oscBLevel?: number;
  readonly filterEnvAmount?: number;
  readonly velocityToFilter?: number;
  readonly subLevel?: number;
  readonly panSpread?: number;
};

export class WebAudioSynthConfiguration {
  private constructor(
    public readonly envelope: EnvelopeADSR,
    public readonly filter: FilterSettings,
    public readonly filterEnvelope: EnvelopeADSR,
    public readonly noteLengthSeconds: number,
    public readonly detuneCents: number,
    public readonly oscBLevel: number,
    public readonly filterEnvAmount: number,
    public readonly velocityToFilter: number,
    public readonly subLevel: number,
    public readonly panSpread: number,
  ) {}

  public static create(
    args: WebAudioSynthConfigurationArgs,
  ): WebAudioSynthConfiguration {
    if (args.noteLengthSeconds !== undefined && args.noteLengthSeconds < 0) {
      throw new Error("Invalid note length");
    }

    if (args.oscBLevel !== undefined && args.oscBLevel < 0) {
      throw new Error("Invalid oscillator B level");
    }

    if (args.subLevel !== undefined && args.subLevel < 0) {
      throw new Error("Invalid sub oscillator level");
    }

    if (args.panSpread !== undefined && args.panSpread < 0) {
      throw new Error("Invalid pan spread");
    }

    return new WebAudioSynthConfiguration(
      args.envelope,
      args.filter,
      args.filterEnvelope ?? args.envelope,
      args.noteLengthSeconds ?? 0.26,
      args.detuneCents ?? 8,
      args.oscBLevel ?? 0.58,
      args.filterEnvAmount ?? 1.45,
      args.velocityToFilter ?? 0.45,
      args.subLevel ?? 0.16,
      args.panSpread ?? 0.14,
    );
  }
}
