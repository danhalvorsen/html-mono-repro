import type { EnvelopeDefinition } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type { OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";

export interface IVoiceLayerDefinition {
  readonly enabled: boolean;
  readonly oscillator: OscillatorDefinition;
  readonly envelope: EnvelopeDefinition;
  readonly gain: number;
}

export interface IVoiceDefinition {
  readonly layers: readonly IVoiceLayerDefinition[];
  readonly outputGain: number;
}
