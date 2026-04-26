import type {
  DistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

export interface IWaveShaperCurveFactory {
  create(definition: DistortionDefinition): Float32Array;
}
