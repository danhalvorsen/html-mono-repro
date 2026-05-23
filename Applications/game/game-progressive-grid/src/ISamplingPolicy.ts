export interface ISamplingPolicy {
  createSamples(start: number, end: number, sampleCount: number): readonly number[];
}
