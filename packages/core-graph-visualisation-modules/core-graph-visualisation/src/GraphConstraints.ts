import type { IGraph } from "@monorepo/core-graph";

export interface GraphCanvasConstraints {
  readonly width: number;
  readonly height: number;
  readonly padding: number;
}

export interface BoxConstraints {
  readonly width: number;
  readonly height: number;
}

export interface GraphNodeAnchor {
  readonly id: string;
  readonly payload: unknown;
  readonly centerX: number;
  readonly centerY: number;
}

export interface GraphEdgeConstraint {
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
}

export interface GraphConstraintModel {
  readonly canvas: GraphCanvasConstraints;
  readonly box: BoxConstraints;
  readonly nodeAnchors: readonly GraphNodeAnchor[];
  readonly edgeConstraints: readonly GraphEdgeConstraint[];
}

export interface IGraphConstraintEngine {
  createConstraints(
    graph: IGraph,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphConstraintModel;
}
