
import type { BuiltAudioGraph } from "../Graph/BuiltAudioGraph.ts";
import type { IVoice } from "./IVoice";
import type { VoiceNote } from "./VoiceNote";
import { VoiceState } from "./VoiceState";

export class Voice implements IVoice {
  readonly #note: VoiceNote;
  readonly #graph: BuiltAudioGraph;

  #state: VoiceState = VoiceState.Created;

  public constructor(note: VoiceNote, graph: BuiltAudioGraph) {
    this.#note = note;
    this.#graph = graph;
  }

  public get note(): VoiceNote {
    return this.#note;
  }

  public get state(): VoiceState {
    return this.#state;
  }

  public start(): void {
    if (this.#state === VoiceState.Disposed) {
      throw new Error("Cannot start a disposed voice.");
    }

    if (this.#state === VoiceState.Started) {
      return;
    }

    if (this.#state === VoiceState.Stopped) {
      throw new Error("Cannot restart a stopped voice.");
    }

    this.#graph.start();
    this.#state = VoiceState.Started;
  }

  public stop(): void {
    if (this.#state === VoiceState.Disposed || this.#state === VoiceState.Stopped) {
      return;
    }

    this.#graph.stop();
    this.#state = VoiceState.Stopped;
  }

  public dispose(): void {
    if (this.#state === VoiceState.Disposed) {
      return;
    }

    this.stop();
    this.#state = VoiceState.Disposed;
  }

  public setFrequencyHz(value: number): void {
    if (this.#state === VoiceState.Disposed) {
      throw new Error("Cannot control a disposed voice.");
    }

    this.#graph.setSourceFrequencyHz(value);
  }
}