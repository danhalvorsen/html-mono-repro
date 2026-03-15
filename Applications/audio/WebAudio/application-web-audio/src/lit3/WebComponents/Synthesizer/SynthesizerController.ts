// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Synthesizer/SynthesizerController.ts

import { DefaultAudioNodeFactory } from "../../../Audio/DefaultAudioNodeFactory.js";
import { MixerBus } from "../../../Audio/MixerBus.js";
import { Guard, type IAudioNodeFactory, type ISynthesizer } from "../../../Audio/MakeIt.js";
import { SynthPresets } from "../../../Audio/SynthPresets.js";
import type { OscillatorModel } from "../OscillatorControl/OscillatorModel.js";
import type { SynthesizerModel } from "./SynthesizerModel.js";

type RuntimeVoice = Readonly<{
  id: string;
  oscillator: OscillatorNode;
  gain: GainNode;
}>;

class LiveSynth implements ISynthesizer {
  public readonly output: AudioNode;
  private started = false;

  public constructor(
    private readonly voices: readonly RuntimeVoice[],
    private readonly mixer: MixerBus,
  ) {
    this.output = mixer.output;
  }

  public get oscillatorIds(): readonly string[] {
    return this.voices.map((voice) => voice.id);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public start(when = 0): void {
    if (this.started) {
      return;
    }

    for (const voice of this.voices) {
      voice.oscillator.start(when);
    }

    this.started = true;
  }

  public stop(when = 0): void {
    if (!this.started) {
      return;
    }

    for (const voice of this.voices) {
      try {
        voice.oscillator.stop(when);
      } catch {
        // OscillatorNode.stop throws if already stopped. Ignored by design.
      }
    }

    this.started = false;
  }

  public dispose(): void {
    this.disconnect();

    for (const voice of this.voices) {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }

    this.mixer.dispose();
  }

  public applyModel(model: SynthesizerModel, when: number): void {
    const normalizedOscillators = normalizeOscillators(model.oscillators);

    if (normalizedOscillators.length !== this.voices.length) {
      throw new Error("LiveSynth cannot apply model with different oscillator count.");
    }

    this.mixer.output.gain.setValueAtTime(
      normalizeMixerLevel(model.mixerLevel, normalizedOscillators.length),
      when,
    );

    for (let index = 0; index < normalizedOscillators.length; index++) {
      const source = normalizedOscillators[index];
      const target = this.voices[index];

      if (!source || !target) {
        throw new Error("LiveSynth voice or oscillator is undefined.");
      }

      if (source.id !== target.id) {
        throw new Error("LiveSynth oscillator identity mismatch.");
      }

      target.oscillator.type = source.type;
      target.oscillator.frequency.setValueAtTime(source.frequency, when);
      target.oscillator.detune.setValueAtTime(source.detune, when);
      target.gain.gain.setValueAtTime(source.gain, when);
    }
  }
}

export class SynthesizerController {
  private context: AudioContext | null = null;
  private synth: LiveSynth | null = null;
  private model: SynthesizerModel = cloneModel(SynthPresets.default);

  public get isPlaying(): boolean {
    return this.synth !== null;
  }

  public get synthesizerModel(): SynthesizerModel {
    return this.model;
  }

  public setModel(model: SynthesizerModel): void {
    const nextModel = cloneModel(model);
    const canApplyLive = this.canApplyLive(nextModel);

    this.model = nextModel;

    if (this.synth === null || this.context === null) {
      return;
    }

    if (canApplyLive) {
      this.synth.applyModel(this.model, this.context.currentTime);
      return;
    }

    this.rebuildLiveSynth();
  }

  public async toggle(): Promise<void> {
    if (this.synth !== null) {
      this.stop();
      return;
    }

    await this.start();
  }

  public async start(): Promise<void> {
    const context = this.getOrCreateContext();

    if (context.state !== "running") {
      await context.resume();
    }

    if (this.synth !== null) {
      return;
    }

    const synth = this.createSynth(context, this.model);
    synth.connect(context.destination);
    synth.start(context.currentTime);

    this.synth = synth;
  }

  public stop(): void {
    if (this.synth === null) {
      return;
    }

    const currentSynth = this.synth;
    this.synth = null;

    try {
      currentSynth.stop(this.context?.currentTime ?? 0);
    } finally {
      currentSynth.dispose();
    }
  }

  public dispose(): void {
    this.stop();

    if (this.context !== null && this.context.state !== "closed") {
      void this.context.close();
    }

    this.context = null;
  }

  private rebuildLiveSynth(): void {
    if (this.context === null || this.synth === null) {
      return;
    }

    const currentTime = this.context.currentTime;
    const oldSynth = this.synth;
    this.synth = null;

    try {
      oldSynth.stop(currentTime);
    } finally {
      oldSynth.dispose();
    }

    const nextSynth = this.createSynth(this.context, this.model);
    nextSynth.connect(this.context.destination);
    nextSynth.start(currentTime);

    this.synth = nextSynth;
  }

  private canApplyLive(model: SynthesizerModel): boolean {
    if (this.synth === null) {
      return false;
    }

    const next = model.oscillators;
    const currentIds = this.synth.oscillatorIds;

    if (currentIds.length !== next.length) {
      return false;
    }

    for (let index = 0; index < currentIds.length; index++) {
      if (currentIds[index] !== next[index]?.id) {
        return false;
      }
    }

    return true;
  }

  private createSynth(context: AudioContext, model: SynthesizerModel): LiveSynth {
    const factory = new DefaultAudioNodeFactory(context);
    const normalizedOscillators = normalizeOscillators(model.oscillators);
    const mixer = new MixerBus(factory, {
      level: normalizeMixerLevel(model.mixerLevel, normalizedOscillators.length),
    });

    const voices = normalizedOscillators.map((oscillator) =>
      this.createVoice(factory, mixer, oscillator),
    );

    return new LiveSynth(voices, mixer);
  }

  private createVoice(
    factory: IAudioNodeFactory,
    mixer: MixerBus,
    model: OscillatorModel,
  ): RuntimeVoice {
    const oscillator = factory.createOscillator({
      type: model.type,
      frequency: model.frequency,
      detune: model.detune,
    });

    const gain = factory.createGain({
      gain: model.gain,
    });

    oscillator.connect(gain);
    gain.connect(mixer.input);

    return {
      id: model.id,
      oscillator,
      gain,
    };
  }

  private getOrCreateContext(): AudioContext {
    if (this.context !== null) {
      return this.context;
    }

    this.context = new AudioContext();
    return this.context;
  }
}

function cloneModel(model: SynthesizerModel): SynthesizerModel {
  return {
    mixerLevel: model.mixerLevel,
    oscillators: model.oscillators.map((oscillator) => ({ ...oscillator })),
  };
}

function normalizeOscillators(
  oscillators: readonly OscillatorModel[],
): readonly OscillatorModel[] {
  if (oscillators.length === 0) {
    return [
      {
        id: "osc-default",
        type: "sine",
        frequency: 440,
        detune: 0,
        gain: 0.25,
      },
    ];
  }

  for (const oscillator of oscillators) {
    Guard.positive("frequency", oscillator.frequency);
    Guard.gain("gain", oscillator.gain);
  }

  const totalGain = oscillators.reduce((sum, item) => sum + item.gain, 0);

  if (totalGain <= 1) {
    return oscillators.map((item) => ({ ...item }));
  }

  const scale = 1 / totalGain;

  return oscillators.map((item) => ({
    ...item,
    gain: item.gain * scale,
  }));
}

function normalizeMixerLevel(level: number, oscillatorCount: number): number {
  Guard.gain("mixerLevel", level);

  if (oscillatorCount <= 1) {
    return level;
  }

  return Math.min(level, 1 / Math.sqrt(oscillatorCount));
}