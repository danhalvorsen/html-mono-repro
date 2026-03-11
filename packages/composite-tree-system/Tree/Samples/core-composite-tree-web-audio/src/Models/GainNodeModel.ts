import { AudioProcessorNodeBase } from "../Nodes/AudioProcessorNodeBase.js";
import { MixerNodeModel } from "./MixerNodeModel.js";
import type { IWebAudioNode } from "../contracts.js";


export class GainNodeModel extends AudioProcessorNodeBase {
  public constructor(
    id: string,
    public readonly gain: number,
    initialChildren: readonly IWebAudioNode[] = []
  ) {
    super(id, initialChildren);

    if (!Number.isFinite(gain)) {
      throw new Error("Gain must have finite gain.");
    }
  }

  protected override ensureCanAdd(child: IWebAudioNode): void {
    super.ensureCanAdd(child);

    if (this.children.length >= 1) {
      throw new Error("Gain node accepts exactly one child.");
    }

    if (child instanceof MixerNodeModel) {
      throw new Error("Gain node cannot directly contain a mixer node.");
    }
  }
}
