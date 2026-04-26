import type {
  AudioSampleValue,
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

export interface IOscillatorAlgorithm<TDefinition extends OscillatorDefinition = OscillatorDefinition> {
  sample(
    definition: TDefinition,
    phase01: number,
  ): AudioSampleValue;
}
