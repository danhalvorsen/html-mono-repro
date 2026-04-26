import type { ISampleBuffer, ISampleBufferProvider } from "./ISampleBufferProvider.js";

export class ThrowingSampleBufferProvider implements ISampleBufferProvider {
  public get(sampleId: string): ISampleBuffer {
    throw new Error(`No sample buffer provider configured for sampleId '${sampleId}'.`);
  }
}
