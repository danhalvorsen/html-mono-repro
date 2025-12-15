import type { CompositeNode } from "./CompositeNode.js";

export interface HitResult {
  node: CompositeNode;
  localPoint: DOMPoint;
}

/**
 * Simple depth-first hit tester for a composite scene graph.
 */
export class HitTester {
  // Depth-first search, returns topmost hit (last drawn wins if children appended)
  hitTest(root: CompositeNode, clientX: number, clientY: number): HitResult | null {
    let hit: HitResult | null = null;
    const stack: { node: CompositeNode; world: DOMMatrix }[] = [{ node: root, world: new DOMMatrix() }];

    while (stack.length) {
      const { node, world } = stack.pop()!;
      const worldMat = world.multiply(node.localMatrix);

      // Quick AABB pruning using node.localBBox if available
      if (node.localBBox) {
        const { x, y, w, h } = node.localBBox;
        const p1 = worldMat.transformPoint(new DOMPoint(x, y));
        const p2 = worldMat.transformPoint(new DOMPoint(x + w, y + h));
        const minX = Math.min(p1.x, p2.x), maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y), maxY = Math.max(p1.y, p2.y);
        if (clientX < minX || clientX > maxX || clientY < minY || clientY > maxY) {
          // skip children for this branch
          continue;
        }
      }

      // precise test: transform point to local space
      const inv = worldMat.inverse();
      if (!inv) continue;
      const local = inv.transformPoint(new DOMPoint(clientX, clientY));

      // If node has localBBox, test it; otherwise try SVG hit testing if element supports it
      if (node.localBBox) {
        const { x, y, w, h } = node.localBBox;
        if (local.x >= x && local.x <= x + w && local.y >= y && local.y <= y + h) {
          const target = node.hitProxyFor ?? node;
          hit = { node: target, localPoint: local };
        }
      } else {
        // fallback: use isPointInFill if available on first child shape
        const firstShape = node.svgGroup.querySelector<SVGGeometryElement>("*");
        if (firstShape && "isPointInFill" in firstShape) {
          try {
            const svg = node.svgGroup.ownerSVGElement!;
            const pt = svg.createSVGPoint();
            pt.x = local.x; pt.y = local.y;
            // isPointInFill expects coordinates in the element's user space
            if ((firstShape as any).isPointInFill(pt)) {
              const target = node.hitProxyFor ?? node;
              hit = { node: target, localPoint: local };
            }
          } catch {
            // ignore
          }
        }
      }

      // push children to stack; push in order so later children are tested first (topmost)
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({ node: node.children[i], world: worldMat });
      }
    }

    return hit;
  }
}
