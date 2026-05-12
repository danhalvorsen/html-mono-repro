import type { IAudioUnit } from "../IAudioUnit";

export class GainUnit implements IAudioUnit {
  readonly #gain: GainNode;

  public constructor(gain: GainNode) {
    this.#gain = gain;
  }

  public get input(): AudioNode {
    return this.#gain;
  }

  public connect(input: AudioNode): void {
    this.#gain.connect(input);
  }

  public disconnect(): void {
    this.#gain.disconnect();
  }
}