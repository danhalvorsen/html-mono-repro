import type { IVoiceSource, VoiceFilterConfig, VoiceTrigger } from "./IVoiceSource.js";

export type VoiceSourceMode = "synth" | "wav";

export class VoicePlaybackEngine {
  private readonly synth: IVoiceSource;
  private readonly wav: IVoiceSource;
  private mode: VoiceSourceMode = "synth";
  private filter: VoiceFilterConfig = {
    enabled: true,
    type: "lowpass",
    frequency: 1200,
    q: 1,
  };

  public constructor(synth: IVoiceSource, wav: IVoiceSource) {
    this.synth = synth;
    this.wav = wav;
    this.synth.setFilter(this.filter);
    this.wav.setFilter(this.filter);
  }

  public setMode(mode: VoiceSourceMode): void {
    this.mode = mode;
  }

  public setFilter(config: VoiceFilterConfig): void {
    this.filter = config;
    this.synth.setFilter(config);
    this.wav.setFilter(config);
  }

  public trigger(voice: VoiceTrigger): void {
    this.resolveSource().trigger(voice);
  }

  private resolveSource(): IVoiceSource {
    return this.mode === "wav" ? this.wav : this.synth;
  }
}
