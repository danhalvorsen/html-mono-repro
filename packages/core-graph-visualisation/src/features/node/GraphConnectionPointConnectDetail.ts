import type { GraphSvgScene } from "src/GraphSvgScene.js";
import type { GraphSvgNodeShapeObject, GraphSvgConnectionPointShape } from "./NodeSvgShape.js";


export interface GraphConnectionPointConnectDetail {
  readonly sourceBox: GraphSvgNodeShapeObject;
  readonly sourceConnectionPoint: GraphSvgConnectionPointShape;
  readonly targetBox: GraphSvgNodeShapeObject;
  readonly targetConnectionPoint: GraphSvgConnectionPointShape;
  readonly scene: GraphSvgScene;
  readonly originalEvent: PointerEvent;
}
