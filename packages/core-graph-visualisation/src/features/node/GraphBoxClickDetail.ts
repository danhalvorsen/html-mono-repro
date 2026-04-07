import type { GraphSvgScene } from "src/GraphSvgScene.js";
import type { GraphSvgNodeShapeObject } from "./NodeSvgShape.js";


export interface GraphBoxClickDetail {
  readonly box: GraphSvgNodeShapeObject;
  readonly scene: GraphSvgScene;
  readonly originalEvent: MouseEvent;
}
