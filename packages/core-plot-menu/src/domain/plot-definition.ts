export type PlotDefinitionKind =
  | "vertical-line"
  | "horizontal-line"
  | "function"
  | "points"
  | "circle"
  | "polyline";

export interface PlotDefinition {
  readonly id: string;
  readonly label: string;
  readonly expression: string;
  readonly kind: PlotDefinitionKind;
  readonly visible: boolean;
}
