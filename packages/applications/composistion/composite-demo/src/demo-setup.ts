import { CompositeNode, HitTester, OnClickBehavior, Rectangle } from "core-composition-svg";

export function setupDemo(selector: string = "svg#scene") {
  const svg = document.querySelector(selector) as SVGSVGElement | null;
  if (!svg) return;

  const root = new CompositeNode("root");

  const rectNode = new Rectangle("rect1", 200, 120, {
    fill: "#cce",
    matrix: new DOMMatrix().translate(100, 50),
  });
  const rectWithHit = new OnClickBehavior("rect1-hit", rectNode, ({ node }) => {
    node.svgGroup.classList.add("active");
  });

  root.addChild(rectWithHit);
  // attach to DOM so the shapes render
  svg.appendChild(root.svgGroup);

  const hitTester = new HitTester();

  svg.addEventListener("pointerdown", (e) => {
    const hit = hitTester.hitTest(root, e.clientX, e.clientY);
    if (hit) hit.node.dispatchHit(e, hit.localPoint);
  });
}
