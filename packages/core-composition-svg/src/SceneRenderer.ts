import type { CompositeNode } from "./CompositeNode.js";

/**
 * Walks the composite tree and applies world transforms to each node's group.
 */
export class SceneRenderer {
  root: CompositeNode;
  svgRoot: SVGSVGElement;
  private needsRender = true;

  constructor(svgRoot: SVGSVGElement, root: CompositeNode) {
    this.svgRoot = svgRoot;
    this.root = root;
    console.debug("[SceneRenderer] init", {
      svgRoot: this.svgRoot,
      rootNode: root,
      rootGroup: root.svgGroup,
      childIds: root.children.map((c) => c.id),
      alreadyAttached: this.svgRoot.contains(root.svgGroup),
    });
    // ensure root group is attached
    if (!this.svgRoot.contains(root.svgGroup)) {
      console.debug("[SceneRenderer] attaching root group");
      this.svgRoot.appendChild(root.svgGroup);
    } else {
      console.debug("[SceneRenderer] root group already attached");
    }
    this.frame = this.frame.bind(this);
    // Expose for debugging in devtools
    (globalThis as any).__sceneRoot = root;
    (globalThis as any).__sceneRenderer = this;
    requestAnimationFrame(this.frame);
  }

  markDirty() { this.needsRender = true; }

  private frame(_ts: number) {
    console.debug("[SceneRenderer] frame start", {
      rootChildren: this.root.children.length,
      rootGroupChildren: this.root.svgGroup.childElementCount,
      childIds: this.root.children.map((c) => c.id),
      groupTags: Array.from(this.root.svgGroup.children).map((el) => el.tagName),
      poses: this.root.children.map((c) => ({
        id: c.id,
        x: c.localMatrix.e,
        y: c.localMatrix.f,
        rotationDeg: Math.round((Math.atan2(c.localMatrix.b, c.localMatrix.a) * 180) / Math.PI),
      })),
      svgMarkup: this.svgRoot.innerHTML,
    });
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
    // Apply only the local transform; parent groups contribute their own transforms.
    node.svgGroup.setAttribute("transform", node.localMatrix.toString());
    for (const c of node.children) this.traverseAndRender(c, world);
  }
}
