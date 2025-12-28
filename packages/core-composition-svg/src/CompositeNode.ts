/**
 * SVG-aware composite node that holds a group element and transform.
 */
export class CompositeNode {
  id: string;
  localMatrix: DOMMatrix;
  svgGroup: SVGGElement;
  children: CompositeNode[] = [];
  visible = true;
  // optional metadata for fast hit pruning
  localBBox?: { x: number; y: number; w: number; h: number };
  private behaviors: NodeBehavior[] = [];
  // If set, hits on this node will be reported as hits on the proxy target
  hitProxyFor?: CompositeNode;

  constructor(id: string, localMatrix?: DOMMatrix) {
    this.id = id;
    this.localMatrix = localMatrix ?? new DOMMatrix();
    this.svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svgGroup.setAttribute("data-id", id);
  }

  add(child: CompositeNode) {
    const node = child as CompositeNode;
    this.children.push(node);
    this.svgGroup.appendChild(node.svgGroup);
  }

  addChild(child: CompositeNode) {
    this.add(child);
  }

  remove(child: CompositeNode) {
    const idx = this.children.indexOf(child as CompositeNode);
    if (idx >= 0) {
      const [removed] = this.children.splice(idx, 1);
      if (removed.svgGroup.parentNode) removed.svgGroup.parentNode.removeChild(removed.svgGroup);
    }
  }

  removeChild(child: CompositeNode) {
    this.remove(child);
  }

  setLocalMatrix(m: DOMMatrix) {
    this.localMatrix = m;
  }

  setLocalBBox(x: number, y: number, w: number, h: number) {
    this.localBBox = { x, y, w, h };
    // store for optional DOM debugging / pruning
    this.svgGroup.setAttribute("data-local-bbox", `${x},${y},${w},${h}`);
  }

  getChildren(): CompositeNode[] {
    return this.children;
  }

  addBehavior(behavior: NodeBehavior) {
    this.behaviors.push(behavior);
    return behavior;
  }

  removeBehavior(behavior: NodeBehavior) {
    const idx = this.behaviors.indexOf(behavior);
    if (idx >= 0) this.behaviors.splice(idx, 1);
  }

  dispatchHit(event: PointerEvent, localPoint: DOMPoint) {
    for (const b of this.behaviors) b.onHit?.(this, event, localPoint);
  }

  setHitProxy(target: CompositeNode | undefined) {
    this.hitProxyFor = target;
  }

  accept(visitor: Visitor): void {
    visitor.visitComposite(this);
    this.children.forEach((c) => c.accept(visitor));
  }
}

export interface NodeBehavior {
  onHit?(node: CompositeNode, event: PointerEvent, localPoint: DOMPoint): void;
}

export interface Visitor {
  visitComposite(node: CompositeNode): void;
}
