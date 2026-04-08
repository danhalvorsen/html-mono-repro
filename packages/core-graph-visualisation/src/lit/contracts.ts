import type { IGraph } from "@monorepo/core-graph";

import type { GraphSvgConnector, GraphSvgScene } from "../GraphSvgScene.js";
import type { GraphAutoScaleMetrics, GraphNodeHierarchy, GraphNodeVisualStyle } from "./types.js";

export interface IGraphHierarchyAnalyzer {
  analyze(graph: IGraph | undefined): Map<string, GraphNodeHierarchy>;
}

export interface IGraphNodeStyler {
  createNodeVisualStyle(
    node: GraphSvgScene["nodes"][number],
    hierarchy: GraphNodeHierarchy | undefined,
    autoScaleMetrics: GraphAutoScaleMetrics,
  ): GraphNodeVisualStyle;

  createNodeColorStyle(
    hierarchy: GraphNodeHierarchy | undefined,
  ): Pick<GraphNodeVisualStyle, "fill" | "stroke" | "text">;

  createAutoScaleMetrics(
    scene: GraphSvgScene,
    hierarchyByNodeId: ReadonlyMap<string, GraphNodeHierarchy>,
  ): GraphAutoScaleMetrics;
}

export interface IGraphNodeStylerFactory {
  create(boxWidth: number, boxHeight: number): IGraphNodeStyler;
}

export interface IGraphConnectorGeometry {
  createEdgeConnector(
    from: GraphSvgScene["nodes"][number],
    to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector;

  createStraightPath(from: GraphSvgConnector, to: GraphSvgConnector): string;

  createConnectionPointConnector(
    center: GraphSvgConnector,
    width: number,
    height: number,
    role: string,
    circleRadius?: number,
    angleDegrees?: number,
  ): GraphSvgConnector;

  repositionConnectionPoint(
    node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    role: GraphSvgScene["nodes"][number]["connectionPoints"][number]["role"],
    angleDegrees?: number,
  ): GraphSvgConnector;
}

export const GRAPH_EVENT_NAMES = {
  boxClick: "graph-box:click",
  boxRightClick: "graph-box:right-click",
  connectionPointClick: "graph-connection-point:click",
  connectionPointRightClick: "graph-connection-point:right-click",
  connectionPointConnect: "graph-connection-point:connect",
  edgeClick: "graph-edge:click",
} as const;
