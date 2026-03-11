import type { IAudioMixerNode, IWebAudioNode } from "../contracts.js";
import { WebAudioCompositeNode } from "./WebAudioCompositeNode.js";

export abstract class AudioMixerNodeBase
  extends WebAudioCompositeNode
  implements IAudioMixerNode {
  protected constructor(
    id: string,
    initialChildren: readonly IWebAudioNode[] = []
  ) {
    super(id, initialChildren);
  }
}
