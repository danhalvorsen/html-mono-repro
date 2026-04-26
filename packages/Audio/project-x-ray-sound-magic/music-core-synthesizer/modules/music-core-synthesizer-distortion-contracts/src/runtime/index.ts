import type { DistortionDefinition } from "../definitions/index.js";
import type {
  DistortionAudioSampleValue,
  DistortionSampleRateHzValue,
} from "../types/index.js";

export interface IDistortionProcessRequest {
  readonly input: DistortionAudioSampleValue;
  readonly sampleRateHz: DistortionSampleRateHzValue;
}

export interface IDistortionProcessResult {
  readonly input: DistortionAudioSampleValue;
  readonly output: DistortionAudioSampleValue;
  readonly wet: DistortionAudioSampleValue;
  readonly dry: DistortionAudioSampleValue;
}

export interface IDistortionStateSnapshot {
  readonly definition: DistortionDefinition;
  readonly lastInput: DistortionAudioSampleValue;
  readonly lastOutput: DistortionAudioSampleValue;
  readonly isBypassed: boolean;
}

export interface IDistortion {
  readonly definition: DistortionDefinition;

  process(request: IDistortionProcessRequest): IDistortionProcessResult;

  snapshot(): IDistortionStateSnapshot;

  reset(): void;
}

export interface IDistortionFactory {
  create(definition: DistortionDefinition): IDistortion;
}
