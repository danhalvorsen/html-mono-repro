// packages/core-design-pattern-composite-tree/src/ICompositeNode.ts

import type { IComponent } from "./IComponent.js";

export interface ICompositeNode<TNode> extends IComponent<TNode> {
  add(child: TNode): void;
  remove(predicate: (child: TNode) => boolean): void;
}