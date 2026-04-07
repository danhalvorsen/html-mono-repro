import type { GraphSvgScene } from "src/GraphSvgScene.js";
import type { GraphSvgNodeShapeObject, GraphSvgConnectionPointShape } from "./NodeSvgShape.js";


export interface GraphConnectionPointRightClickDetail {
  readonly box: GraphSvgNodeShapeObject;
  readonly connectionPoint: GraphSvgConnectionPointShape;
  readonly scene: GraphSvgScene;
  readonly originalEvent: MouseEvent;
}
