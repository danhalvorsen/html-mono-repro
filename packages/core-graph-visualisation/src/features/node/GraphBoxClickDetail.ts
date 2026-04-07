import type { GraphSvgScene } from "../../GraphSvgScene.js";
import type { GraphSvgNodeShapeObject } from "./NodeSvgShape.js";


export interface GraphBoxClickDetail {
  readonly box: GraphSvgNodeShapeObject;
  readonly scene: GraphSvgScene;
  readonly originalEvent: MouseEvent;
}
