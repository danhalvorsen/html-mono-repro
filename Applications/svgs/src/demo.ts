import {
  SemanticNode,
  AnchorExpression,
  RectangleAnchors
} from "core-composition-abstract-copy";

import { Rectangle } from "../src/primitives/base/Rectangle.js";
import { SvgSeparatorNode } from "../src/scene/SvgSeparatorNode.js";

export function buildDemoScene() {
  const root = new SvgSeparatorNode("root");

  const parent = new Rectangle("parent", 200, 120, { fill: "#335" });
  const child = new Rectangle("child", 80, 60, { fill: "#5a9" });

  root.addChild(parent);
  parent.addChild(child);

  const parentAnchors = new RectangleAnchors("parent");
  const childAnchors = new RectangleAnchors("child");

  const constraint =
    new AnchorExpression(childAnchors.Top.Midpoint)
      .connectTo(parentAnchors.Right.Midpoint)
      .withOffset(10, 0)
      .build();

  // Semantic attachment point (solver will consume this later)
  const semantic = new SemanticNode(
    { kind: "constraint", constraint },
    root
  );

  return semantic;
}
