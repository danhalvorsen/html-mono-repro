import type { IWebAudioNode } from "../contracts.js";
import { AudioMixerNodeBase } from "../Nodes/AudioMixerNodeBase.js";

export class MixerNodeModel extends AudioMixerNodeBase {
  public constructor(
    id: string,
    initialChildren: readonly IWebAudioNode[] = []
  ) {
    super(id, initialChildren);
  }
}