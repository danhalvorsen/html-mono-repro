import type { GraphSvgEdgeShapeObject, GraphSvgScene } from "../../GraphSvgScene.js";

export interface GraphEdgeClickDetail {
  readonly edge: GraphSvgEdgeShapeObject;
  readonly scene: GraphSvgScene;
  readonly originalEvent: MouseEvent;
}

