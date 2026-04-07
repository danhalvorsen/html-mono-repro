import type { GraphSvgConnector } from "../../GraphSvgScene.js";

export interface GraphSvgConnectionPointShape {
  readonly id: string;
  readonly role: "top" | "right" | "bottom" | "left";
  readonly connector: GraphSvgConnector;
}

export interface GraphSvgNodeBoxShape {
  readonly topLeft: GraphSvgConnector;
  readonly width: number;
  readonly height: number;
}

export interface GraphSvgNodeShapeObject {
  readonly id: string;
  readonly label: string;
  readonly payload: unknown;
  readonly center: GraphSvgConnector;
  readonly box: GraphSvgNodeBoxShape;
  readonly connectionPoints: readonly GraphSvgConnectionPointShape[];
}
