import { LeafNode } from "@monorepo/core-composite-tree-abstract";
import type { IWebAudioNode } from '../contracts.js';

export abstract class WebAudioLeafNode
  extends LeafNode<IWebAudioNode>
  implements IWebAudioNode {
  protected constructor(id: string) {
    super(id);
  }
}
