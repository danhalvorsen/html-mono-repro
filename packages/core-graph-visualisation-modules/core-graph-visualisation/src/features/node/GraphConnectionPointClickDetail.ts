import type { GraphSvgScene } from "../../GraphSvgScene.js";
import type { GraphSvgNodeShapeObject, GraphSvgConnectionPointShape } from "./NodeSvgShape.js";


export interface GraphConnectionPointClickDetail {
  readonly box: GraphSvgNodeShapeObject;
  readonly connectionPoint: GraphSvgConnectionPointShape;
  readonly scene: GraphSvgScene;
  readonly originalEvent: MouseEvent;
}
