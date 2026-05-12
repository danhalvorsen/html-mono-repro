
import type { IAudioSource } from "../IAudioSource";
import type { IAudioUnit } from "../IAudioUnit";
import type { IAudioOutput } from "../Inputs/IAudioOutput";
import { BuiltAudioGraph } from "./BuiltAudioGraph.ts";

export class AudioGraphBuilder {
  readonly #context: AudioContext;
  readonly #units: IAudioUnit[] = [];

  #source?: IAudioSource;

  public constructor(context: AudioContext) {
    this.#context = context;
  }

  public source(source: IAudioSource): this {
    this.#source = source;
    return this;
  }

  public add(unit: IAudioUnit): this {
    this.#units.push(unit);
    return this;
  }

  public connectToDestination(): BuiltAudioGraph {
    if (!this.#source) {
      throw new Error("Missing audio source.");
    }

    let output: IAudioOutput = this.#source;

    for (const unit of this.#units) {
      output.connect(unit.input);
      output = unit;
    }

    output.connect(this.#context.destination);

    return new BuiltAudioGraph(this.#source, this.#units);
  }
}