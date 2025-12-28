import { CompositeNode } from "./CompositeNode";
import { IComposite } from "./IComposite";
import { ISemantic } from "./ISemantic";

// ---------- Semantic Scope Node ----------
/**
 * Wraps a subtree with semantic intent.
 * Semantics apply to all descendants until overridden.
 */

export class SemanticNode extends CompositeNode {
  constructor(
    public readonly semantic: ISemantic,
    child: IComposite
  ) {
    super([child]);
  }
}
