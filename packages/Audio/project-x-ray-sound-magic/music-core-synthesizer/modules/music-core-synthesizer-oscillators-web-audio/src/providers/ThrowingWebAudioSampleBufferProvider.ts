import type {
  IWebAudioAudioBufferLike,
  IWebAudioSampleBufferProvider,
} from "../ports/index.js";

export class ThrowingWebAudioSampleBufferProvider implements IWebAudioSampleBufferProvider {
  public get(sampleId: string): IWebAudioAudioBufferLike {
    throw new Error(`No Web Audio sample buffer provider configured for sampleId '${sampleId}'.`);
  }
}
