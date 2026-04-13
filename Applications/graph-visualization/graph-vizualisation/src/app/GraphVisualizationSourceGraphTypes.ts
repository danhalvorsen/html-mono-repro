export type SourceGraphId =
  | "domain"
  | "web-component-hierarchy"
  | "reactive-controller-ownership"
  | "application-architecture";

export interface SourceGraphOption {
  readonly id: SourceGraphId;
  readonly label: string;
}
