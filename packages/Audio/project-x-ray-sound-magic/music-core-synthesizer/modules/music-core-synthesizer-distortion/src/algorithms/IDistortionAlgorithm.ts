import type {
  DistortionAudioSampleValue,
  DistortionDefinition,
  DistortionSampleRateHzValue,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

export interface IDistortionAlgorithm<TDefinition extends DistortionDefinition = DistortionDefinition> {
  process(
    input: DistortionAudioSampleValue,
    definition: TDefinition,
    sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue;

  reset(): void;
}
