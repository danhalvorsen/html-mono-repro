import { CompositeNode, type NodeBehavior } from "../CompositeNode.js";

/**
 * Behavior wrapper that can enclose a visual node and mirror its bbox.
 */
export abstract class BehaviorNode extends CompositeNode implements NodeBehavior {
  // Behaviors surface the onHit contract; concrete behaviors implement it.
  abstract onHit?(node: CompositeNode, event: PointerEvent, localPoint: DOMPoint): void;
  protected child?: CompositeNode;

  constructor(id: string, child?: CompositeNode) {
    super(id);
    if (child) this.setChild(child);
  }

  setChild(child: CompositeNode) {
    if (this.child) this.removeChild(this.child);
    this.child = child;
    this.addChild(child);
    // Proxy hits on the child to this behavior node
    child.setHitProxy(this);
    if (child.localBBox) {
      const { x, y, w, h } = child.localBBox;
      this.setLocalBBox(x, y, w, h);
    }
  }
}
