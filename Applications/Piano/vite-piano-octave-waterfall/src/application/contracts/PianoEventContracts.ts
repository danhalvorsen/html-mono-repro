export class PianoEventName {
  public static readonly TangentHoldStart = "tangent-hold-start";
  public static readonly TangentHoldEnd = "tangent-hold-end";
}

export interface PianoOctaveEventDetail {
  readonly octave: { readonly index: number };
  readonly octaveIndex: number;
}

export interface TangentHoldStartDetail extends PianoOctaveEventDetail {
  readonly holdId: string;
  readonly note: string;
  readonly midiNote: number;
}

export interface TangentHoldEndDetail extends PianoOctaveEventDetail {
  readonly holdId: string;
  readonly note: string;
  readonly holdMs: number;
  readonly midiNote: number;
}
