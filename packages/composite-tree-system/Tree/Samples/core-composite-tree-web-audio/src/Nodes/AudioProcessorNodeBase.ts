import type { IAudioProcessorNode, IWebAudioNode } from "../contracts.js";
import { WebAudioCompositeNode } from "./WebAudioCompositeNode.js";

export abstract class AudioProcessorNodeBase
  extends WebAudioCompositeNode
  implements IAudioProcessorNode {
  protected constructor(
    id: string,
    initialChildren: readonly IWebAudioNode[] = []
  ) {
    super(id, initialChildren);
  }
}
