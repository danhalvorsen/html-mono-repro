export type SpatialRelation =
  | "Top"
  | "Bottom"
  | "Left"
  | "Right"
  | "Inside"
  | "Outside"
  | "Align"
  | "Center";

export interface SpatialConstraint {
  relation: SpatialRelation;
  target: string;
  offset?: number;
}