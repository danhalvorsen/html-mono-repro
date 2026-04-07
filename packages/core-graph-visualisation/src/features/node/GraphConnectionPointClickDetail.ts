import type { GraphSvgScene } from "src/GraphSvgScene.js";
import type { GraphSvgNodeShapeObject, GraphSvgConnectionPointShape } from "./NodeSvgShape.js";


export interface GraphConnectionPointClickDetail {
  readonly box: GraphSvgNodeShapeObject;
  readonly connectionPoint: GraphSvgConnectionPointShape;
  readonly scene: GraphSvgScene;
  readonly originalEvent: MouseEvent;
}
