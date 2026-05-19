import type { VoiceKey } from "../value-objects/VoiceKey.js";
import type { IVoice } from "./IVoice.js";

export interface IVoiceRegistry {
  add(voice: IVoice): void;
  takeNext(key: VoiceKey): IVoice | undefined;
  getAll(channel?: number): readonly IVoice[];
  clear(channel?: number): void;
}
