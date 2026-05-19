import type { VoiceKey } from "../value-objects/VoiceKey.js";
import type { IVoice } from "./IVoice.js";
import type { IVoiceRegistry } from "./IVoiceRegistry.js";

export class WebAudioVoiceRegistry implements IVoiceRegistry {
  private readonly voicesByKey = new Map<string, IVoice[]>();

  public add(voice: IVoice): void {
    const key = voice.key.toString();
    const existing = this.voicesByKey.get(key);

    if (existing === undefined) {
      this.voicesByKey.set(key, [voice]);
      return;
    }

    existing.push(voice);
  }

  public takeNext(key: VoiceKey): IVoice | undefined {
    const mapKey = key.toString();
    const voices = this.voicesByKey.get(mapKey);

    if (voices === undefined || voices.length === 0) {
      return undefined;
    }

    const voice = voices.shift();

    if (voices.length === 0) {
      this.voicesByKey.delete(mapKey);
    }

    return voice;
  }

  public getAll(channel?: number): readonly IVoice[] {
    const result: IVoice[] = [];

    for (const voices of this.voicesByKey.values()) {
      for (const voice of voices) {
        if (channel !== undefined && !voice.key.belongsToChannel(channel)) {
          continue;
        }

        result.push(voice);
      }
    }

    return result;
  }

  public clear(channel?: number): void {
    if (channel === undefined) {
      this.voicesByKey.clear();
      return;
    }

    for (const [key, voices] of this.voicesByKey) {
      if (voices.some((voice) => voice.key.belongsToChannel(channel))) {
        this.voicesByKey.delete(key);
      }
    }
  }
}
