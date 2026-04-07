import type { GraphSvgConnector } from "../../GraphSvgScene.js";

export interface GraphSvgEdgeEndShape {
  readonly nodeId: string;
  readonly connector: GraphSvgConnector;
}

export interface GraphSvgEdgeLineShape {
  readonly path: string;
}

export interface GraphSvgEdgeShapeObject {
  readonly id: string;
  readonly start: GraphSvgEdgeEndShape;
  readonly edge: GraphSvgEdgeLineShape;
  readonly end: GraphSvgEdgeEndShape;
}
