import type { IAudioOutput } from "./Inputs/IAudioOutput";

export interface IAudioSource extends IAudioOutput {
  start(): void;
  stop(): void;
  setFrequencyHz(value: number): void;
}