export interface ISampleBuffer {
  readonly length: number;

  sample(position: number): number;
}

export interface ISampleBufferProvider {
  get(sampleId: string): ISampleBuffer;
}
