export interface VoiceTrigger {
  readonly note: number;
  readonly velocity: number;
  readonly holdMs: number;
  readonly rootNote: number;
}

export type VoiceFilterType = "lowpass" | "bandpass" | "highpass";

export interface VoiceFilterConfig {
  readonly enabled: boolean;
  readonly type: VoiceFilterType;
  readonly frequency: number;
  readonly q: number;
}

export interface IVoiceSource {
  trigger(voice: VoiceTrigger): void;
  setFilter(config: VoiceFilterConfig): void;
}
