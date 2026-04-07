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

export interface GraphLayoutRequest {
  readonly graph: IGraph;
  readonly canvas: GraphCanvasConstraints;
  readonly box: BoxConstraints;
}

export interface GraphNodeAnchor<TPayload = unknown> {
  readonly id: string;
  readonly payload: TPayload;
  readonly centerX: number;
  readonly centerY: number;
}

export interface GraphEdgeRouteConstraint {
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
}

export interface GraphLayoutModel<TPayload = unknown> {
  readonly canvas: GraphCanvasConstraints;
  readonly box: BoxConstraints;
  readonly nodeAnchors: readonly GraphNodeAnchor<TPayload>[];
  readonly edgeConstraints: readonly GraphEdgeRouteConstraint[];
}
