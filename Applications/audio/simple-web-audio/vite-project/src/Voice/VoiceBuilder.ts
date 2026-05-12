import { EqualTemperamentFrequencyStrategy } from "../EqualTemperamentFrequencyStrategy";
import { GainBuilder } from "../Gain/GainBuilder";
import { AudioGraphBuilder } from "../Graph/AudioGraphBuilder";
import type { IAudioUnit } from "../IAudioUnit";
import type { INoteFrequencyStrategy } from "../INoteFrequencyStrategy";
import { OscillatorBuilder } from "../Oscilators/OscillatorBuilder";
import type { IVoice } from "./IVoice";
import { Voice } from "./Voice";

export class VoiceBuilder {
  readonly #context: AudioContext;
  readonly #units: IAudioUnit[] = [];

  #noteNumber = 69;
  #velocity = 0.25;
  #oscillatorType: OscillatorType = "sawtooth";
  #frequencyStrategy: INoteFrequencyStrategy = new EqualTemperamentFrequencyStrategy();

  public constructor(context: AudioContext) {
    this.#context = context;
  }

  public noteNumber(value: number): this {
    if (!Number.isInteger(value) || value < 0 || value > 127) {
      throw new Error("MIDI note number must be an integer between 0 and 127.");
    }

    this.#noteNumber = value;
    return this;
  }

  public velocity(value: number): this {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("Voice velocity must be between 0 and 1.");
    }

    this.#velocity = value;
    return this;
  }

  public oscillatorType(value: OscillatorType): this {
    this.#oscillatorType = value;
    return this;
  }

  public frequencyStrategy(value: INoteFrequencyStrategy): this {
    this.#frequencyStrategy = value;
    return this;
  }

  public add(unit: IAudioUnit): this {
    this.#units.push(unit);
    return this;
  }

  public build(): IVoice {
    const frequencyHz = this.#frequencyStrategy.toFrequencyHz(this.#noteNumber);

    const source = new OscillatorBuilder(this.#context)
      .type(this.#oscillatorType)
      .frequency(frequencyHz)
      .build();

    const velocityGain = new GainBuilder(this.#context)
      .gain(this.#velocity)
      .build();

    const graphBuilder = new AudioGraphBuilder(this.#context)
      .source(source)
      .add(velocityGain);

    for (const unit of this.#units) {
      graphBuilder.add(unit);
    }

    const graph = graphBuilder.connectToDestination();

    return new Voice(
      {
        noteNumber: this.#noteNumber,
        velocity: this.#velocity,
        frequencyHz,
      },
      graph,
    );
  }
}