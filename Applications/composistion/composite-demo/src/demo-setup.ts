import { CompositeNode, Rectangle } from "core-composition-svg";
import { SceneRenderer } from "./SceneRenderer.js";

/**
 * Minimal setup that renders just a rectangle through the shared composite renderer.
 */
export function setupDemo(selector: string = "svg#scene") {
  const svg = document.querySelector(selector) as SVGSVGElement | null;
  if (!svg) return;

  const root = new CompositeNode("root");
  const rectNode = new Rectangle("rect1", 200, 120, {
    fill: "#cce",
    matrix: new DOMMatrix().translate(100, 50),
  });

  root.addChild(rectNode);
  svg.appendChild(root.svgGroup);

  new SceneRenderer(svg, root);
}
