export const PIANO_EVENTS = Object.freeze({
  tangentHoldStart: "tangent-hold-start",
  tangentHoldEnd: "tangent-hold-end",
  tangentClick: "tangent-click"
});

export interface TangentHoldStartDetail {
  readonly holdId: string;
  readonly note: string;
  readonly octaveIndex: number;
}

export interface TangentHoldEndDetail {
  readonly holdId: string;
  readonly note: string;
  readonly holdMs: number;
  readonly octaveIndex: number;
}
