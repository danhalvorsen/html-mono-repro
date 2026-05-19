import type {
  IVoiceSource,
  VoiceFilterConfig,
  VoiceTrigger,
} from "./IVoiceSource.js";

export class WavVoiceSource implements IVoiceSource {
  private readonly context = new AudioContext();
  private sampleBuffer: AudioBuffer | null = null;
  private loadedName = "";
  private filter: VoiceFilterConfig = {
    enabled: true,
    type: "lowpass",
    frequency: 1200,
    q: 1,
  };

  public get sampleName(): string {
    return this.loadedName;
  }

  public get hasSample(): boolean {
    return this.sampleBuffer !== null;
  }

  public async loadFile(file: File): Promise<void> {
    const bytes = await file.arrayBuffer();
    this.sampleBuffer = await this.context.decodeAudioData(bytes.slice(0));
    this.loadedName = file.name;
  }

  public trigger(voice: VoiceTrigger): void {
    const sample = this.sampleBuffer;
    if (sample === null) {
      return;
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    const source = this.context.createBufferSource();
    source.buffer = sample;

    const gain = this.context.createGain();
    gain.gain.value = Math.max(0.0001, voice.velocity / 127);

    const semitoneOffset = voice.note - voice.rootNote;
    source.playbackRate.value = Math.pow(2, semitoneOffset / 12);

    if (this.filter.enabled) {
      const filter = this.context.createBiquadFilter();
      filter.type = this.filter.type;
      filter.frequency.value = this.filter.frequency;
      filter.Q.value = this.filter.q;
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }

    gain.connect(this.context.destination);
    source.start();
    source.stop(this.context.currentTime + Math.max(0.03, voice.holdMs / 1000));
  }

  public setFilter(config: VoiceFilterConfig): void {
    this.filter = config;
  }
}
