import type { ISamplingPolicy } from "./ISamplingPolicy.js";

export class UniformSamplingPolicy implements ISamplingPolicy {
  public createSamples(start: number, end: number, sampleCount: number): readonly number[] {
    if (!Number.isFinite(start)) {
      throw new Error("Sample start must be finite.");
    }

    if (!Number.isFinite(end)) {
      throw new Error("Sample end must be finite.");
    }

    if (!Number.isInteger(sampleCount) || sampleCount < 2) {
      throw new Error("Sample count must be an integer greater than or equal to 2.");
    }

    if (!(start < end)) {
      throw new Error("Sample start must be lower than sample end.");
    }

    const samples: number[] = [];

    for (let index = 0; index < sampleCount; index += 1) {
      const ratio = index / (sampleCount - 1);
      samples.push(start + (end - start) * ratio);
    }

    return Object.freeze(samples);
  }
}
