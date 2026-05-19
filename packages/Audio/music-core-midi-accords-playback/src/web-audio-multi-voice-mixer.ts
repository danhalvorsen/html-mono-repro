export type MultiVoiceSourceType = "wav" | "osc";
export type MultiVoiceOscType = "sine" | "square" | "sawtooth" | "triangle";
export type MultiVoiceFilterType = "lowpass" | "bandpass" | "highpass";

export interface MultiVoiceSourceConfig {
  readonly type: MultiVoiceSourceType;
  readonly oscillator: MultiVoiceOscType;
  readonly gain: number;
  readonly detuneCents: number;
  readonly playbackRate: number;
  readonly loop: boolean;
  readonly file?: File | null;
}

export interface MultiVoiceAdsrConfig {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
}

export interface MultiVoiceFilterConfig {
  readonly enabled: boolean;
  readonly type: MultiVoiceFilterType;
  readonly frequency: number;
  readonly q: number;
}

export interface MultiVoiceConfig {
  readonly noteHz: number;
  readonly source: MultiVoiceSourceConfig;
  readonly adsr: MultiVoiceAdsrConfig;
  readonly filter: MultiVoiceFilterConfig;
}

export interface MultiVoiceMixerConfig {
  readonly masterGain: number;
  readonly pan: number;
  readonly muted: boolean;
}

type ActiveNode = {
  readonly source: AudioBufferSourceNode | OscillatorNode;
  readonly amp: GainNode;
  readonly releaseSeconds: number;
};

export class WebAudioMultiVoiceMixer {
  private static readonly NOTE_GATE_SECONDS = 0.35;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterPan: StereoPannerNode | null = null;
  private readonly active: ActiveNode[] = [];
  private readonly wavCache = new WeakMap<File, AudioBuffer>();

  public async trigger(
    voices: MultiVoiceConfig[],
    mixer: MultiVoiceMixerConfig,
    options?: { sustain?: boolean },
  ): Promise<void> {
    if (voices.length === 0) {
      return;
    }

    this.ensureGraph();
    this.applyMixer(mixer);

    const context = this.context as AudioContext;
    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;
    this.stopAt(now);

    const sustain = options?.sustain ?? false;

    for (const voice of voices) {
      const built = await this.buildVoice(voice);
      if (built === null) {
        continue;
      }

      built.source.connect(built.input);
      if (built.filter !== null) {
        built.filter.connect(built.amp);
      }
      built.amp.connect(this.masterPan as StereoPannerNode);
      this.scheduleAdsr(built.amp.gain, now, voice.adsr, voice.source.gain);
      built.source.start(now);

      if (!sustain) {
        this.scheduleRelease(
          built.amp.gain,
          now + WebAudioMultiVoiceMixer.NOTE_GATE_SECONDS,
          voice.adsr.release,
        );
        built.source.stop(
          now +
            WebAudioMultiVoiceMixer.NOTE_GATE_SECONDS +
            Math.max(0.02, voice.adsr.release + 0.01),
        );
      }

      this.active.push({
        source: built.source,
        amp: built.amp,
        releaseSeconds: voice.adsr.release,
      });
    }
  }

  public stop(): void {
    if (this.context === null) {
      return;
    }
    this.stopAt(this.context.currentTime);
  }

  private ensureGraph(): void {
    if (this.context !== null) {
      return;
    }

    this.context = new AudioContext();
    this.masterPan = this.context.createStereoPanner();
    this.masterGain = this.context.createGain();
    this.masterPan.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
  }

  private applyMixer(mixer: MultiVoiceMixerConfig): void {
    if (this.masterPan === null || this.masterGain === null) {
      return;
    }
    this.masterPan.pan.value = mixer.pan;
    this.masterGain.gain.value = mixer.muted ? 0 : mixer.masterGain;
  }

  private scheduleAdsr(
    param: AudioParam,
    now: number,
    adsr: MultiVoiceAdsrConfig,
    sourceGain: number,
  ): void {
    const a = Math.max(0.001, adsr.attack);
    const d = Math.max(0.001, adsr.decay);
    const baseGain = Math.max(0.0001, sourceGain);
    const sustainRatio = Math.max(0, Math.min(1, adsr.sustain));
    const sustainGain = baseGain * sustainRatio;
    param.cancelScheduledValues(now);
    param.setValueAtTime(0.0001, now);
    param.linearRampToValueAtTime(baseGain, now + a);
    param.linearRampToValueAtTime(sustainGain, now + a + d);
  }

  private scheduleRelease(param: AudioParam, releaseAt: number, releaseSeconds: number): void {
    const r = Math.max(0.01, releaseSeconds);
    param.cancelScheduledValues(releaseAt);
    param.setValueAtTime(param.value, releaseAt);
    param.linearRampToValueAtTime(0.0001, releaseAt + r);
  }

  private stopAt(now: number): void {
    for (const active of this.active.splice(0)) {
      try {
        active.amp.gain.cancelScheduledValues(now);
        active.amp.gain.setValueAtTime(active.amp.gain.value, now);
        active.amp.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.01, active.releaseSeconds));
        active.source.stop(now + Math.max(0.02, active.releaseSeconds + 0.01));
      } catch {
        // no-op
      }
    }
  }

  private async buildVoice(
    voice: MultiVoiceConfig,
  ): Promise<{
    source: AudioBufferSourceNode | OscillatorNode;
    input: AudioNode;
    filter: BiquadFilterNode | null;
    amp: GainNode;
  } | null> {
    const context = this.context as AudioContext;
    const amp = context.createGain();
    amp.gain.value = Math.max(0.0001, voice.source.gain);

    const filter = voice.filter.enabled
      ? this.createFilter(context, voice.filter)
      : null;
    const input = filter ?? amp;

    if (voice.source.type === "wav") {
      const file = voice.source.file;
      if (file === undefined || file === null) {
        return null;
      }
      const source = context.createBufferSource();
      source.buffer = await this.decode(file);
      source.loop = voice.source.loop;
      source.playbackRate.value = voice.source.playbackRate;
      source.detune.value = voice.source.detuneCents;
      return { source, input, filter, amp };
    }

    const osc = context.createOscillator();
    osc.type = voice.source.oscillator;
    osc.frequency.value = voice.noteHz;
    osc.detune.value = voice.source.detuneCents;
    return { source: osc, input, filter, amp };
  }

  private createFilter(context: AudioContext, filter: MultiVoiceFilterConfig): BiquadFilterNode {
    const node = context.createBiquadFilter();
    node.type = filter.type;
    node.frequency.value = filter.frequency;
    node.Q.value = filter.q;
    return node;
  }

  private async decode(file: File): Promise<AudioBuffer> {
    const existing = this.wavCache.get(file);
    if (existing !== undefined) {
      return existing;
    }
    const bytes = await file.arrayBuffer();
    const buffer = await (this.context as AudioContext).decodeAudioData(bytes.slice(0));
    this.wavCache.set(file, buffer);
    return buffer;
  }
}
