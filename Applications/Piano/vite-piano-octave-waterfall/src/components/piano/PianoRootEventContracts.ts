import type { Vector2 } from "@monorepo/core-math";

export type TangentKeyType = "white" | "black";

export class TangentInputEventName {
  public static readonly Pressed = "tangent-pressed";
  public static readonly Released = "tangent-released";
}

export class PianoNoteEventName {
  public static readonly NoteOn = "piano-note-on";
  public static readonly NoteOff = "piano-note-off";
}

export class PianoRootEventName {
  public static readonly TangentPressed = PianoNoteEventName.NoteOn;
  public static readonly TangentReleased = PianoNoteEventName.NoteOff;
}

export type TangentEventPayload = {
  readonly id: string;
  readonly note: string;
  readonly keyType: TangentKeyType;
  readonly points: readonly Vector2[];
  readonly midiNote: number | null;
};

export type BaseTangentEventDetail = {
  readonly pointerId: number;
  readonly node?: HTMLElement;
  readonly tangent: TangentEventPayload;
};

export type TangentInputEventDetail = BaseTangentEventDetail;

export type PianoRootTangentEventKind = "pressed" | "released";

export type PianoNoteEventDetail = BaseTangentEventDetail & {
  readonly kind: PianoRootTangentEventKind;
};

export type PianoRootTangentEventDetail = PianoNoteEventDetail;
