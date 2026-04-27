export const MidiMessageKinds = {
  noteOn: "note-on",
  noteOff: "note-off",
  controlChange: "control-change",
  pitchBend: "pitch-bend",
  systemExclusive: "system-exclusive",
} as const;

export type MidiMessageKind =
  (typeof MidiMessageKinds)[keyof typeof MidiMessageKinds];