/* ===================== core-midi-player (WebAudio, ADSR + Filter, SRP) ===================== */

import { MidiStatus, type MidiMessage } from "@monorepo/music-core-midi";

/* ---------- PORT ---------- */

export interface IMidiPlayer {
  play(message: MidiMessage, options?: MidiPlaybackOptions): void;
}

export type MidiPlaybackOptions = {
  readonly noteLengthSeconds?: number;
  readonly filterFrequency?: number;
  readonly filterQ?: number;
  readonly sustain?: number;
};

/* ---------- VALUE OBJECTS (SYNTH PARAMS) ---------- */

export class EnvelopeADSR {
  private constructor(
    public readonly attack: number,
    public readonly decay: number,
    public readonly sustain: number,
    public readonly release: number
  ) {}

  public static create(a: number, d: number, s: number, r: number): EnvelopeADSR {
    if (a < 0 || d < 0 || s < 0 || s > 1 || r < 0) {
      throw new Error("Invalid ADSR");
    }
    return new EnvelopeADSR(a, d, s, r);
  }
}

export const FilterType = {
  LowPass: "lowpass",
  HighPass: "highpass",
  BandPass: "bandpass",
} as const;

export type FilterType = (typeof FilterType)[keyof typeof FilterType];

export class FilterSettings {
  private constructor(
    public readonly type: FilterType,
    public readonly frequency: number,
    public readonly q: number
  ) {}

  public static create(type: FilterType, freq: number, q: number): FilterSettings {
    if (freq <= 0 || q <= 0) throw new Error("Invalid filter");
    return new FilterSettings(type, freq, q);
  }
}

/* ---------- PLAYER ---------- */

export class WebAudioMidiPlayer implements IMidiPlayer {
  private readonly context: AudioContext;
  private readonly envelope: EnvelopeADSR;
  private readonly filterEnvelope: EnvelopeADSR;
  private readonly filter: FilterSettings;
  private readonly noteLengthSeconds: number;
  private readonly detuneCents: number;
  private readonly filterEnvAmount: number;
  private readonly velocityToFilter: number;
  private readonly subLevel: number;
  private readonly panSpread: number;

  public constructor(args: {
    context?: AudioContext;
    envelope: EnvelopeADSR;
    filter: FilterSettings;
    filterEnvelope?: EnvelopeADSR;
    noteLengthSeconds?: number;
    detuneCents?: number;
    filterEnvAmount?: number;
    velocityToFilter?: number;
    subLevel?: number;
    panSpread?: number;
  }) {
    this.context = args.context ?? new AudioContext();
    this.envelope = args.envelope;
    this.filterEnvelope = args.filterEnvelope ?? args.envelope;
    this.filter = args.filter;
    this.noteLengthSeconds = args.noteLengthSeconds ?? 0.26;
    this.detuneCents = args.detuneCents ?? 8;
    this.filterEnvAmount = args.filterEnvAmount ?? 1.45;
    this.velocityToFilter = args.velocityToFilter ?? 0.45;
    this.subLevel = args.subLevel ?? 0.16;
    this.panSpread = args.panSpread ?? 0.14;
  }

  public play(message: MidiMessage, options?: MidiPlaybackOptions): void {
    if (message.status !== MidiStatus.NoteOn || message.velocity.value() === 0) return;

    if (this.context.state === "suspended") {
      void this.context.resume().then(() => this.play(message, options)).catch(() => undefined);
      return;
    }

    const note = message.note.value();
    const velocity = message.velocity.value();

    const freq = WebAudioMidiPlayer.midiToFrequency(note);

    const oscA = this.context.createOscillator();
    const oscB = this.context.createOscillator();
    const oscSub = this.context.createOscillator();

    const oscAGain = this.context.createGain();
    const oscBGain = this.context.createGain();
    const oscSubGain = this.context.createGain();

    const panA = this.context.createStereoPanner();
    const panB = this.context.createStereoPanner();
    const mix = this.context.createGain();

    const amp = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    /* oscillator stack (detuned dual saw + subtle sub) */
    oscA.type = "sawtooth";
    oscB.type = "sawtooth";
    oscSub.type = "square";

    oscA.frequency.value = freq;
    oscB.frequency.value = freq;
    oscSub.frequency.value = freq / 2;

    oscA.detune.value = -this.detuneCents;
    oscB.detune.value = this.detuneCents;
    oscSub.detune.value = -2;

    oscAGain.gain.value = 0.58;
    oscBGain.gain.value = 0.58;
    oscSubGain.gain.value = this.subLevel;

    panA.pan.value = -this.panSpread;
    panB.pan.value = this.panSpread;

    /* filter */
    const effectiveFilterFrequency = options?.filterFrequency ?? this.filter.frequency;
    const effectiveFilterQ = options?.filterQ ?? this.filter.q;

    filter.type = this.filter.type;
    filter.frequency.value = effectiveFilterFrequency * 0.62;
    filter.Q.value = effectiveFilterQ;

    /* amp envelope (ADSR) */
    const now = this.context.currentTime;
    const { attack, decay, sustain, release } = this.envelope;
    const {
      attack: filterAttack,
      decay: filterDecay,
      sustain: filterSustain,
      release: filterRelease,
    } = this.filterEnvelope;

    const peak = (velocity / 127) * 0.9;
    const sustainFactor = options?.sustain ?? sustain;
    const sustainLevel = peak * Math.max(0, Math.min(1, sustainFactor));

    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(peak, now + attack);
    amp.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);

    /* filter envelope: bright attack then settle */
    const filterBase = effectiveFilterFrequency;
    const velocityFactor = 1 + this.velocityToFilter * (velocity / 127);
    const filterPeak = filterBase * this.filterEnvAmount * velocityFactor;
    const filterSustainFrequency = filterBase * Math.max(0.4, filterSustain);
    filter.frequency.setValueAtTime(filterBase * 0.62, now);
    filter.frequency.linearRampToValueAtTime(filterPeak, now + Math.max(0.01, filterAttack));
    filter.frequency.linearRampToValueAtTime(filterSustainFrequency, now + filterAttack + filterDecay);

    /* release scheduled */
    const noteLength = options?.noteLengthSeconds ?? this.noteLengthSeconds;
    const releaseStart = now + noteLength;

    amp.gain.setValueAtTime(sustainLevel, releaseStart);
    amp.gain.linearRampToValueAtTime(0, releaseStart + release);

    filter.frequency.setValueAtTime(filterSustainFrequency, releaseStart);
    filter.frequency.linearRampToValueAtTime(filterBase * 0.58, releaseStart + filterRelease);

    /* connect */
    oscA.connect(oscAGain);
    oscB.connect(oscBGain);
    oscSub.connect(oscSubGain);

    oscAGain.connect(panA);
    oscBGain.connect(panB);

    panA.connect(mix);
    panB.connect(mix);
    oscSubGain.connect(mix);

    mix.connect(filter);
    filter.connect(amp);
    amp.connect(this.context.destination);

    const stopAt = releaseStart + Math.max(release, filterRelease);
    oscA.start(now);
    oscB.start(now);
    oscSub.start(now);

    oscA.stop(stopAt);
    oscB.stop(stopAt);
    oscSub.stop(stopAt);
  }

  private static midiToFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
}

/* ---------- PRESET (Van Halen Jump-ish) ---------- */

export const JumpPreset = {
  envelope: EnvelopeADSR.create(0.008, 0.11, 0.58, 0.23),
  filter: FilterSettings.create(FilterType.LowPass, 2200, 1.7),
  filterEnvelope: EnvelopeADSR.create(0.01, 0.16, 0.62, 0.28),
  noteLengthSeconds: 0.24,
  detuneCents: 10,
  filterEnvAmount: 1.55,
  velocityToFilter: 0.55,
  subLevel: 0.12,
  panSpread: 0.15,
};

export const RealInstrumentPresets = {
  analogBrass: {
    envelope: EnvelopeADSR.create(0.01, 0.14, 0.62, 0.24),
    filter: FilterSettings.create(FilterType.LowPass, 2100, 1.9),
    filterEnvelope: EnvelopeADSR.create(0.012, 0.2, 0.58, 0.3),
    noteLengthSeconds: 0.24,
    detuneCents: 11,
    filterEnvAmount: 1.7,
    velocityToFilter: 0.62,
    subLevel: 0.12,
    panSpread: 0.16,
  },
  electricPiano: {
    envelope: EnvelopeADSR.create(0.002, 0.32, 0.15, 0.35),
    filter: FilterSettings.create(FilterType.LowPass, 2900, 0.9),
    filterEnvelope: EnvelopeADSR.create(0.004, 0.25, 0.4, 0.35),
    noteLengthSeconds: 0.22,
    detuneCents: 4,
    filterEnvAmount: 1.25,
    velocityToFilter: 0.7,
    subLevel: 0.05,
    panSpread: 0.08,
  },
  warmPad: {
    envelope: EnvelopeADSR.create(0.12, 0.35, 0.75, 0.55),
    filter: FilterSettings.create(FilterType.LowPass, 1600, 0.7),
    filterEnvelope: EnvelopeADSR.create(0.18, 0.5, 0.68, 0.6),
    noteLengthSeconds: 0.4,
    detuneCents: 7,
    filterEnvAmount: 1.2,
    velocityToFilter: 0.3,
    subLevel: 0.18,
    panSpread: 0.2,
  },
  synthPluck: {
    envelope: EnvelopeADSR.create(0.001, 0.1, 0.05, 0.12),
    filter: FilterSettings.create(FilterType.LowPass, 3200, 1.3),
    filterEnvelope: EnvelopeADSR.create(0.002, 0.09, 0.15, 0.12),
    noteLengthSeconds: 0.17,
    detuneCents: 3,
    filterEnvAmount: 1.4,
    velocityToFilter: 0.8,
    subLevel: 0.04,
    panSpread: 0.06,
  },
} as const;