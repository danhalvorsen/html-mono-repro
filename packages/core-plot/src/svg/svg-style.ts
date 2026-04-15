import type { StyleState } from "../styles/style-state.js";

export interface SvgStyle {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: string;
  readonly opacity?: number;
  readonly state?: StyleState;
}
