import { CompositeNode } from "@monorepo/core-composite-tree-abstract";
import type { IWebAudioNode } from '../contracts.js'

export abstract class WebAudioCompositeNode
  extends CompositeNode<IWebAudioNode>
  implements IWebAudioNode {
  protected constructor(
    id: string,
    initialChildren: readonly IWebAudioNode[] = []
  ) {
    super(id, initialChildren);
  }
}
