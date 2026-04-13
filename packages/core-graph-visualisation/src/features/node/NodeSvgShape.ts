import type { GraphSvgConnector } from "../../layout/GraphGeometry.js";

export type GraphNodeVisualRepresentation = "box" | "circle";

export interface GraphSvgCircleConnectorDefinition {
  readonly mode?: "fixed" | "equal";
  readonly angles?: readonly number[];
  readonly count?: number;
}

export interface GraphSvgNodeVisualDefinition {
  readonly representation?: GraphNodeVisualRepresentation;
  readonly circleConnectors?: GraphSvgCircleConnectorDefinition;
}

export interface GraphSvgConnectionPointShape {
  readonly id: string;
  readonly role: string;
  readonly connector: GraphSvgConnector;
  readonly angleDegrees?: number;
}

export interface GraphSvgNodeBoxShape {
  readonly topLeft: GraphSvgConnector;
  readonly width: number;
  readonly height: number;
}

export interface GraphSvgNodeCircleShape {
  readonly radius: number;
}

export interface GraphSvgNodeShapeObject<TPayload = unknown> {
  readonly id: string;
  readonly label: string;
  readonly payload: TPayload;
  readonly center: GraphSvgConnector;
  readonly representation: GraphNodeVisualRepresentation;
  readonly box: GraphSvgNodeBoxShape;
  readonly circle?: GraphSvgNodeCircleShape;
  readonly connectionPoints: readonly GraphSvgConnectionPointShape[];
}
