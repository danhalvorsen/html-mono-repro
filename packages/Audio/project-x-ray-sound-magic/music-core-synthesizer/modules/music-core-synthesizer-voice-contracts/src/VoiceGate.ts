export interface IVoiceGateOnRequest {
  readonly timeSeconds: number;
  readonly frequencyHz: number;
  readonly velocity: number;
}

export interface IVoiceGateOffRequest {
  readonly timeSeconds: number;
}
