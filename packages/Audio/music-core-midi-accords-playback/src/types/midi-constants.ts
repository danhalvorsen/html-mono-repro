export const enum MidiLogicalEventKind {
  Meta = "meta",
  SysEx = "sysex",
  NoteOn = "note-on",
  NoteOff = "note-off",
  Channel = "channel",
  System = "system",
}

export const enum MidiChannelMessageKind {
  NoteOff = "note-off",
  NoteOn = "note-on",
  PolyphonicKeyPressure = "polyphonic-key-pressure",
  ControlChange = "control-change",
  ProgramChange = "program-change",
  ChannelPressure = "channel-pressure",
  PitchBend = "pitch-bend",
}

export const enum MidiMetaEventKind {
  SetTempo = "set-tempo",
  TimeSignature = "time-signature",
  KeySignature = "key-signature",
  TrackName = "track-name",
  EndOfTrack = "end-of-track",
  Unknown = "unknown",
}

export const enum MidiStatus {
  Meta = 0xff,
  SysExStart = 0xf0,
  SysExEscape = 0xf7,
}

export const enum MidiChannelCommand {
  NoteOff = 0x80,
  NoteOn = 0x90,
  PolyphonicKeyPressure = 0xa0,
  ControlChange = 0xb0,
  ProgramChange = 0xc0,
  ChannelPressure = 0xd0,
  PitchBend = 0xe0,
}

export const DefaultTempoMicrosecondsPerQuarterNote = 500_000;
