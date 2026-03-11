// src/web-audio-builder-factory.ts

// ============================================================
// Contracts
// ============================================================

export interface IAudioComponent {
  connect(destination: AudioNode): void;
  disconnect(): void;
  dispose(): void;
}

export interface IStartable {
  start(when?: number): void;
  stop(when?: number): void;
}

export interface ISynthesizer extends IAudioComponent, IStartable {
  readonly output: AudioNode;
}

export interface IOscillatorConfig {
  readonly type: OscillatorType;
  readonly frequency: number;
  readonly detune: number;
}

export interface IGainConfig {
  readonly gain: number;
}

export interface IMixerConfig {
  readonly level: number;
}

export interface ISimpleSynthConfig {
  readonly oscillator: IOscillatorConfig;
  readonly voiceGain: IGainConfig;
  readonly mixer: IMixerConfig;
}

export interface IAudioNodeFactory {
  createOscillator(config: IOscillatorConfig): OscillatorNode;
  createGain(config: IGainConfig): GainNode;
  createMixer(config: IMixerConfig): GainNode;
}

export interface ISynthBuilder {
  withOscillatorType(type: OscillatorType): ISynthBuilder;
  withFrequency(value: number): ISynthBuilder;
  withDetune(value: number): ISynthBuilder;
  withVoiceGain(value: number): ISynthBuilder;
  withMixerLevel(value: number): ISynthBuilder;
  build(): ISynthesizer;
}

export interface ISynthFactory {
  createDefault(): ISynthesizer;
  createLead(): ISynthesizer;
  createBass(): ISynthesizer;
}

// ============================================================
// Guards
// ============================================================

class Guard {
  public static positive(name: string, value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be > 0`);
    }
  }

  public static gain(name: string, value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be >= 0`);
    }
  }
}

// ============================================================
// WebAudio Node Factory
// ============================================================

export class DefaultAudioNodeFactory implements IAudioNodeFactory {

  public constructor(private readonly context: BaseAudioContext) {}

  public createOscillator(config: IOscillatorConfig): OscillatorNode {

    Guard.positive("frequency", config.frequency);

    const node = this.context.createOscillator();

    node.type = config.type;
    node.frequency.value = config.frequency;
    node.detune.value = config.detune;

    return node;
  }

  public createGain(config: IGainConfig): GainNode {

    Guard.gain("gain", config.gain);

    const node = this.context.createGain();
    node.gain.value = config.gain;

    return node;
  }

  public createMixer(config: IMixerConfig): GainNode {

    Guard.gain("mixer", config.level);

    const node = this.context.createGain();
    node.gain.value = config.level;

    return node;
  }
}

// ============================================================
// Mixer
// ============================================================

class MixerBus implements IAudioComponent {

  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(factory: IAudioNodeFactory, config: IMixerConfig) {

    const mixer = factory.createMixer(config);

    this.input = mixer;
    this.output = mixer;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public dispose(): void {
    this.disconnect();
  }
}

// ============================================================
// Synth implementation
// ============================================================

class SimpleSynth implements ISynthesizer {

  public readonly output: AudioNode;

  private started = false;

  public constructor(
    private readonly oscillator: OscillatorNode,
    private readonly gain: GainNode,
    private readonly mixer: MixerBus
  ) {

    oscillator.connect(gain);
    gain.connect(mixer.input);

    this.output = mixer.output;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public start(when = 0): void {

    if (this.started) return;

    this.oscillator.start(when);
    this.started = true;
  }

  public stop(when = 0): void {

    if (!this.started) return;

    this.oscillator.stop(when);
  }

  public dispose(): void {

    this.disconnect();

    this.oscillator.disconnect();
    this.gain.disconnect();
    this.mixer.dispose();
  }
}

// ============================================================
// Builder
// ============================================================

export class SimpleSynthBuilder implements ISynthBuilder {

  private config: ISimpleSynthConfig = {
    oscillator: {
      type: "sine",
      frequency: 440,
      detune: 0
    },
    voiceGain: {
      gain: 0.25
    },
    mixer: {
      level: 1
    }
  };

  public constructor(private readonly factory: IAudioNodeFactory) {}

  public withOscillatorType(type: OscillatorType): ISynthBuilder {

    this.config = {
      ...this.config,
      oscillator: { ...this.config.oscillator, type }
    };

    return this;
  }

  public withFrequency(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      oscillator: { ...this.config.oscillator, frequency: value }
    };

    return this;
  }

  public withDetune(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      oscillator: { ...this.config.oscillator, detune: value }
    };

    return this;
  }

  public withVoiceGain(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      voiceGain: { gain: value }
    };

    return this;
  }

  public withMixerLevel(value: number): ISynthBuilder {

    this.config = {
      ...this.config,
      mixer: { level: value }
    };

    return this;
  }

  public build(): ISynthesizer {

    const osc = this.factory.createOscillator(this.config.oscillator);
    const gain = this.factory.createGain(this.config.voiceGain);
    const mixer = new MixerBus(this.factory, this.config.mixer);

    return new SimpleSynth(osc, gain, mixer);
  }
}

// ============================================================
// Preset factory (GOF Factory)
// ============================================================

class PresetSynthFactory implements ISynthFactory {

  public constructor(private readonly nodeFactory: IAudioNodeFactory) {}

  public createDefault(): ISynthesizer {

    return new SimpleSynthBuilder(this.nodeFactory)
      .withOscillatorType("sine")
      .withFrequency(440)
      .withVoiceGain(0.25)
      .build();
  }

  public createLead(): ISynthesizer {

    return new SimpleSynthBuilder(this.nodeFactory)
      .withOscillatorType("sawtooth")
      .withFrequency(660)
      .withDetune(8)
      .withVoiceGain(0.15)
      .build();
  }

  public createBass(): ISynthesizer {

    return new SimpleSynthBuilder(this.nodeFactory)
      .withOscillatorType("square")
      .withFrequency(110)
      .withDetune(-4)
      .withVoiceGain(0.2)
      .build();
  }
}

// ============================================================
// Composition root
// ============================================================

export function createSynthFactory(context: AudioContext): ISynthFactory {

  const nodeFactory = new DefaultAudioNodeFactory(context);

  return new PresetSynthFactory(nodeFactory);
}