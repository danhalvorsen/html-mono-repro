// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/AudioContextTimeProvider.ts

export class AudioContextTimeProvider {
  public constructor(private readonly context: AudioContext) {}

  public now(): number {
    return this.context.currentTime;
  }
}