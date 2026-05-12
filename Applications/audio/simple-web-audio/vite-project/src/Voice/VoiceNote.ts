export type VoiceNote = Readonly<{
  readonly noteNumber: number;
  readonly velocity: number;
  readonly frequencyHz: number;
}>;