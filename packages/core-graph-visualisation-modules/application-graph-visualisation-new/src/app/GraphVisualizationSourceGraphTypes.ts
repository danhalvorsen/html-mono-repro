export type SourceGraphId =
  | "domain"
  | "web-component-hierarchy"
  | "reactive-controller-ownership"
  | "application-architecture"
  | "hierarchical-organization"
  | "champions-league-players";

export interface SourceGraphOption {
  readonly id: SourceGraphId;
  readonly label: string;
}