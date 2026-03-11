// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Synthesizer/SynthesizerController.ts

import { DefaultAudioNodeFactory } from "../../../Audio/DefaultAudioNodeFactory.js";
import { SimpleSynthBuilder } from "../../../Audio/SimpleSynthBuilder.js";
import type { ISynthesizer } from "../../../Audio/MakeIt.js";
import type { SynthesizerModel } from "./SynthesizerModel.js";

export class SynthesizerController {
  private context: AudioContext | null = null;
  private synth: ISynthesizer | null = null;
  private model: SynthesizerModel = {
    oscillators: [],
    mixerLevel: 1,
  };

  public get isPlaying(): boolean {
    return this.synth !== null;
  }

  public get synthesizerModel(): SynthesizerModel {
    return this.model;
  }

  public setModel(model: SynthesizerModel): void {
    this.model = model;
  }

  public async start(): Promise<void> {
    const context = this.getOrCreateContext();

    if (context.state !== "running") {
      await context.resume();
    }

    if (this.synth !== null) {
      return;
    }

    this.synth = this.createSynth(context);
    this.synth.connect(context.destination);
    this.synth.start(context.currentTime);
  }

  public stop(): void {
    if (this.synth === null) {
      return;
    }

    const synth = this.synth;
    this.synth = null;

    try {
      synth.stop();
    } finally {
      synth.dispose();
    }
  }

  public async toggle(): Promise<void> {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    await this.start();
  }

  public dispose(): void {
    this.stop();

    if (this.context !== null && this.context.state !== "closed") {
      void this.context.close();
    }

    this.context = null;
  }

  private createSynth(context: AudioContext): ISynthesizer {
    const nodeFactory = new DefaultAudioNodeFactory(context);
    const builder = new SimpleSynthBuilder(nodeFactory)
      .withMixerLevel(this.model.mixerLevel);

    for (const oscillator of this.model.oscillators) {
      builder.addOscillator(oscillator);
    }

    return builder.build();
  }

  private getOrCreateContext(): AudioContext {
    if (this.context !== null) {
      return this.context;
    }

    this.context = new AudioContext();
    return this.context;
  }
}