export class PianoEventName {
  public static readonly TangentHoldStart = "tangent-hold-start";
  public static readonly TangentHoldEnd = "tangent-hold-end";
  public static readonly TangentClick = "tangent-click";
}

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
