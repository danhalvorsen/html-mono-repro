import type { VoiceNote } from "./VoiceNote.ts";
import type { VoiceState } from "./VoiceState.ts";

export interface IVoice {
  readonly note: VoiceNote;
  readonly state: VoiceState;

  start(): void;
  stop(): void;
  dispose(): void;
  setFrequencyHz(value: number): void;
}