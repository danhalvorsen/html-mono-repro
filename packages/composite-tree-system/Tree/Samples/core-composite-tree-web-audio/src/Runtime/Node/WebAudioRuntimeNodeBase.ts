import type { IWebAudioRuntimeNode } from "./IWebAudioRuntimeNode.js";

export abstract class WebAudioRuntimeNodeBase implements IWebAudioRuntimeNode {

  protected constructor(
    public readonly input: AudioNode,
    public readonly output: AudioNode
  ) {}

  public dispose(): void {
    try {
      this.output.disconnect();
    } catch {}

    if (this.input !== this.output) {
      try {
        this.input.disconnect();
      } catch {}
    }
  }
}
