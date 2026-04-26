import type {
  IWebAudioBufferSourceNodeLike,
  IWebAudioContextLike,
  IWebAudioGainNodeLike,
  IWebAudioOscillatorNodeLike,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";

export class BrowserWebAudioContextAdapter implements IWebAudioContextLike {
  public constructor(private readonly context: AudioContext) {}

  public get sampleRate(): number {
    return this.context.sampleRate;
  }

  public createGain(): IWebAudioGainNodeLike {
    return this.context.createGain() as unknown as IWebAudioGainNodeLike;
  }

  public createOscillator(): IWebAudioOscillatorNodeLike {
    return this.context.createOscillator() as unknown as IWebAudioOscillatorNodeLike;
  }

  public createBufferSource(): IWebAudioBufferSourceNodeLike {
    return this.context.createBufferSource() as unknown as IWebAudioBufferSourceNodeLike;
  }
}
