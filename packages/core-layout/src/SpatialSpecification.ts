import { RectangleNode } from "./types/RectangleNode.js";

export namespace GeometryUtils {
  export function getRotatedBounds(node: RectangleNode) {
    const angle = (node.rotation ?? 0) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Beregn hjørner etter rotasjon (rundt senter)
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;

    const corners = [
      rotatePoint(node.x, node.y, cx, cy, cos, sin),
      rotatePoint(node.x + node.width, node.y, cx, cy, cos, sin),
      rotatePoint(node.x + node.width, node.y + node.height, cx, cy, cos, sin),
      rotatePoint(node.x, node.y + node.height, cx, cy, cos, sin),
    ];

    const xs = corners.map(p => p.x);
    const ys = corners.map(p => p.y);
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
      center: { x: cx, y: cy },
    };
  }

  function rotatePoint(x: number, y: number, cx: number, cy: number, cos: number, sin: number) {
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  }
}
