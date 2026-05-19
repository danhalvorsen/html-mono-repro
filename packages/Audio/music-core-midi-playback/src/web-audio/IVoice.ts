import type { VoiceKey } from "../value-objects/VoiceKey.js";

export interface IVoice {
  readonly key: VoiceKey;
  readonly isReleased: boolean;

  release(releaseAtSeconds: number): void;
  stopImmediately(stopAtSeconds: number): void;
}
