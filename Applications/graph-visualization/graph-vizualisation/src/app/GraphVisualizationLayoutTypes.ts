import type { GraphNodeVisualRepresentation } from "@monorepo/core-graph-visualisation";

export type LayoutOptionId =
  | "d3-force"
  | "d3-spring-simulation"
  | "grid"
  | "dgml-layered-top-to-bottom"
  | "dgml-layered-bottom-to-top"
  | "dgml-layered-left-to-right"
  | "dgml-layered-right-to-left"
  | "dgml-clustered"
  | "dgml-force"
  | (string & {});

export interface LayoutOptionDescriptor {
  readonly id: LayoutOptionId;
  readonly label: string;
}

export type NodeRepresentationOption = GraphNodeVisualRepresentation;
