import type { GraphSvgScene } from "../GraphSvgScene.js";

export interface GraphNodeHierarchy {
  readonly level: number;
  readonly subLevel: number;
  readonly levelSize: number;
  readonly maxLevel: number;
  readonly subgraphIndex: number;
}

export interface GraphNodeVisualStyle {
  readonly fill: string;
  readonly stroke: string;
  readonly text: string;
  readonly width: number;
  readonly height: number;
  readonly topLeftX: number;
  readonly topLeftY: number;
}

export interface GraphAutoScaleMetrics {
  readonly nodeScale: number;
}

export type GraphSceneNode = GraphSvgScene["nodes"][number];
