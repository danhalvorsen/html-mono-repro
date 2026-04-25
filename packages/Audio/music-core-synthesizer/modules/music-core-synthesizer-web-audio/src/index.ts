// packages/Audio/music-core-synthesizer-web-audio/src/index.ts

import type {
  Hertz,
  IDistortionDefinition,
  IEnvelopeDefinition,
  IWebAudioContextFactory,
  IWebAudioEnvelopeScheduler,
  IWebAudioMasterBus,
  IWebAudioNoiseSourceFactory,
  IWebAudioVoiceFactory,
  IWebAudioVoiceGraph,
  IWebAudioVoiceGraphBuilder,
  IFilterDefinition,
  IVoiceDefinition,
  IVoiceHandle,
  MidiNoteNumber,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  DistortionType,
  FilterType,
} from "@monorepo/music-core-synthesizer-contracts";

export class WebAudioContextFactory implements IWebAudioContextFactory {
  public create(): AudioContext {
    return new AudioContext();
  }
}

export class WebAudioMasterBus implements IWebAudioMasterBus {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(
    private readonly context: AudioContext,
    initialGain: Normalized = 0.8,
  ) {
    WebAudioGuards.normalized(initialGain, "initialGain");

    this.input = context.createGain();
    this.output = context.createGain();

    this.input.connect(this.output);
    this.output.gain.setValueAtTime(initialGain, context.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public setGain(value: Normalized, at: Seconds): void {
    WebAudioGuards.normalized(value, "master gain");
    this.output.gain.setValueAtTime(value, at);
  }

  public dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
  }
}

export class WebAudioEnvelopeScheduler implements IWebAudioEnvelopeScheduler {
  public noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);
    WebAudioGuards.normalized(velocity, "velocity");

    const attackEnd = at + env.attackSeconds;
    const decayEnd = attackEnd + env.decaySeconds;
    const sustain = env.sustainLevel * velocity;

    param.cancelScheduledValues(at);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(velocity, attackEnd);
    param.linearRampToValueAtTime(sustain, decayEnd);
  }

  public noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void {
    WebAudioGuards.envelope(env);

    const releaseEnd = at + env.releaseSeconds;

    param.cancelScheduledValues(at);
    param.setValueAtTime(param.value, at);
    param.linearRampToValueAtTime(0, releaseEnd);
  }

  public cancel(param: AudioParam, at: Seconds): void {
    param.cancelScheduledValues(at);
  }
}

export class WebAudioWhiteNoiseSourceFactory implements IWebAudioNoiseSourceFactory {
  public constructor(private readonly durationSeconds = 2) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("Noise buffer duration must be greater than zero.");
    }
  }

  public create(context: AudioContext): AudioNode {
    const frameCount = Math.ceil(context.sampleRate * this.durationSeconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();

    return source;
  }
}

export class WebAudioVoiceGraphBuilder implements IWebAudioVoiceGraphBuilder {
  public constructor(
    private readonly noiseSourceFactory: IWebAudioNoiseSourceFactory,
  ) {}

  public build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph {
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");
    WebAudioGuards.voiceDefinition(request.definition);

    const oscillator = request.context.createOscillator();
    oscillator.type = request.definition.oscillator.waveform;
    oscillator.frequency.setValueAtTime(
      request.frequencyHz,
      request.context.currentTime,
    );
    oscillator.detune.setValueAtTime(
      request.definition.oscillator.detuneCents,
      request.context.currentTime,
    );

    const oscillatorGain = request.context.createGain();
    oscillatorGain.gain.setValueAtTime(
      request.definition.oscillator.gain,
      request.context.currentTime,
    );

    const filter = this.createFilterOrNull(
      request.context,
      request.definition.filter,
    );

    const distortion = this.createDistortionOrNull(
      request.context,
      request.definition.distortion,
    );

    const vca = request.context.createGain();
    vca.gain.setValueAtTime(0, request.context.currentTime);

    oscillator.connect(oscillatorGain);

    const firstProcessor = filter ?? distortion ?? vca;
    oscillatorGain.connect(firstProcessor);

    if (filter !== null && distortion !== null) {
      filter.connect(distortion);
      distortion.connect(vca);
    } else if (filter !== null) {
      filter.connect(vca);
    } else if (distortion !== null) {
      distortion.connect(vca);
    }

    const noise = this.createNoiseOrNull(
      request.context,
      request.definition,
      firstProcessor,
    );

    vca.connect(request.destination);

    return {
      output: vca,
      oscillator,
      vca,
      filter,
      distortion,
      noise,
    };
  }

  private createFilterOrNull(
    context: AudioContext,
    definition: IFilterDefinition,
  ): BiquadFilterNode | null {
    if (!definition.enabled) {
      return null;
    }

    WebAudioGuards.frequency(definition.cutoffHz, "filter cutoffHz");

    if (!Number.isFinite(definition.resonanceQ) || definition.resonanceQ < 0) {
      throw new Error("filter resonanceQ must be >= 0.");
    }

    const node = context.createBiquadFilter();

    switch (definition.type) {
      case FilterType.LowPass:
        node.type = "lowpass";
        break;
      case FilterType.HighPass:
        node.type = "highpass";
        break;
      case FilterType.BandPass:
        node.type = "bandpass";
        break;
      default:
        throw new Error("Unsupported filter type.");
    }

    node.frequency.setValueAtTime(definition.cutoffHz, context.currentTime);
    node.Q.setValueAtTime(definition.resonanceQ, context.currentTime);

    return node;
  }

  private createDistortionOrNull(
    context: AudioContext,
    definition: IDistortionDefinition,
  ): WaveShaperNode | null {
    if (!definition.enabled || definition.type === DistortionType.None) {
      return null;
    }

    WebAudioGuards.normalized(definition.amount, "distortion amount");

    const node = context.createWaveShaper();
    node.curve = WebAudioDistortionCurveFactory.create(definition);
    node.oversample = "4x";

    return node;
  }

  private createNoiseOrNull(
    context: AudioContext,
    definition: IVoiceDefinition,
    destination: AudioNode,
  ): AudioNode | null {
    if (!definition.noise.enabled || definition.noise.gain <= 0) {
      return null;
    }

    WebAudioGuards.normalized(definition.noise.gain, "noise gain");

    const source = this.noiseSourceFactory.create(context);
    const gain = context.createGain();

    gain.gain.setValueAtTime(definition.noise.gain, context.currentTime);

    source.connect(gain);
    gain.connect(destination);

    return source;
  }
}

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly graphBuilder: IWebAudioVoiceGraphBuilder,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
  ) {}

  public create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle {
    WebAudioGuards.normalized(request.velocity, "velocity");
    WebAudioGuards.frequency(request.frequencyHz, "frequencyHz");

    const graph = this.graphBuilder.build({
      context: request.context,
      destination: request.destination,
      definition: request.definition,
      frequencyHz: request.frequencyHz,
    });

    return new WebAudioVoiceHandle(
      graph,
      this.envelopeScheduler,
      request.definition.envelope,
      request.note,
      request.velocity,
      request.startedAt,
    );
  }
}

export class WebAudioVoiceHandle implements IVoiceHandle {
  public readonly id: string;
  public readonly note: MidiNoteNumber;

  private released = false;
  private disposed = false;
  private started = false;

  public constructor(
    private readonly graph: IWebAudioVoiceGraph,
    private readonly envelopeScheduler: IWebAudioEnvelopeScheduler,
    private readonly envelope: IEnvelopeDefinition,
    note: MidiNoteNumber,
    private readonly velocity: Normalized,
    startedAt: Seconds,
  ) {
    this.id = `${note}:${startedAt}`;
    this.note = note;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public start(at: Seconds): void {
    this.throwIfDisposed();

    if (this.started) {
      throw new Error("Voice has already been started.");
    }

    this.started = true;

    this.envelopeScheduler.noteOn(
      this.graph.vca.gain,
      this.envelope,
      this.velocity,
      at,
    );

    this.graph.oscillator.start(at);
  }

  public release(at: Seconds): void {
    if (this.disposed || this.released) {
      return;
    }

    this.released = true;

    this.envelopeScheduler.noteOff(this.graph.vca.gain, this.envelope, at);

    const stopAt = at + this.envelope.releaseSeconds + 0.02;

    try {
      this.graph.oscillator.stop(stopAt);
    } catch {
      this.dispose();
      return;
    }

    this.graph.oscillator.addEventListener("ended", () => this.dispose(), {
      once: true,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.graph.oscillator.disconnect();
    this.graph.vca.disconnect();
    this.graph.filter?.disconnect();
    this.graph.distortion?.disconnect();
    this.graph.noise?.disconnect();
  }

  private throwIfDisposed(): void {
    if (this.disposed) {
      throw new Error("Voice has already been disposed.");
    }
  }
}

export class WebAudioDistortionCurveFactory {
  private static readonly sampleCount = 2048;

  public static create(
    definition: IDistortionDefinition,
  ): Float32Array<ArrayBuffer> {
    WebAudioGuards.normalized(definition.amount, "distortion amount");

    switch (definition.type) {
      case DistortionType.SoftClip:
        return this.softClip(definition.amount);
      case DistortionType.HardClip:
        return this.hardClip(definition.amount);
      case DistortionType.Tanh:
        return this.tanh(definition.amount);
      case DistortionType.None:
        return this.identity();
      default:
        throw new Error("Unsupported distortion type.");
    }
  }

  private static createCurve(): Float32Array<ArrayBuffer> {
    return new Float32Array(
      new ArrayBuffer(this.sampleCount * Float32Array.BYTES_PER_ELEMENT),
    );
  }

  private static identity(): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x;
    }

    return curve;
  }

  private static softClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 20;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = x / (1 + Math.abs(x * drive));
    }

    return curve;
  }

  private static hardClip(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const threshold = Math.max(0.05, 1 - amount);

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x)) / threshold;
    }

    return curve;
  }

  private static tanh(amount: Normalized): Float32Array<ArrayBuffer> {
    const curve = this.createCurve();
    const drive = 1 + amount * 40;

    for (let i = 0; i < curve.length; i++) {
      const x = (i * 2) / (curve.length - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }

    return curve;
  }
}

class WebAudioGuards {
  public static normalized(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be in range 0..1.`);
    }
  }

  public static frequency(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  public static envelope(env: IEnvelopeDefinition): void {
    if (!Number.isFinite(env.attackSeconds) || env.attackSeconds < 0) {
      throw new Error("Envelope attackSeconds must be >= 0.");
    }

    if (!Number.isFinite(env.decaySeconds) || env.decaySeconds < 0) {
      throw new Error("Envelope decaySeconds must be >= 0.");
    }

    if (!Number.isFinite(env.releaseSeconds) || env.releaseSeconds < 0) {
      throw new Error("Envelope releaseSeconds must be >= 0.");
    }

    this.normalized(env.sustainLevel, "Envelope sustainLevel");
  }

  public static voiceDefinition(definition: IVoiceDefinition): void {
    this.normalized(definition.oscillator.gain, "oscillator gain");
    this.envelope(definition.envelope);
    this.normalized(definition.noise.gain, "noise gain");
    this.normalized(definition.distortion.amount, "distortion amount");
  }
}