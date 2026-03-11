import type { IAudioSourceNode } from "../contracts.js";
import { WebAudioLeafNode } from "./WebAudioLeafNode.js";

export abstract class AudioSourceNodeBase
  extends WebAudioLeafNode
  implements IAudioSourceNode {
  protected constructor(id: string) {
    super(id);
  }
}
