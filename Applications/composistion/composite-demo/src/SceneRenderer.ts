import type { CompositeNode } from "@monorepo/core-composition-svg";

export class SceneRenderer {
  root: CompositeNode;
  svgRoot: SVGSVGElement;
  private needsRender = true;

  constructor(svgRoot: SVGSVGElement, root: CompositeNode) {
    this.svgRoot = svgRoot;
    this.root = root;
    // ensure root group is attached
    if (!this.svgRoot.contains(root.svgGroup)) this.svgRoot.appendChild(root.svgGroup);
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  markDirty() { this.needsRender = true; }

  private frame(_ts: number) {
    if (this.needsRender) {
      this.updateWorldMatricesAndRender();
      this.needsRender = false;
    }
    requestAnimationFrame(this.frame);
  }

  private updateWorldMatricesAndRender() {
    const identity = new DOMMatrix();
    this.traverseAndRender(this.root, identity);
  }

  private traverseAndRender(node: CompositeNode, parentWorld: DOMMatrix) {
    const world = parentWorld.multiply(node.localMatrix);
    node.svgGroup.setAttribute('transform', world.toString());
    for (const c of node.children) this.traverseAndRender(c, world);
  }
}
