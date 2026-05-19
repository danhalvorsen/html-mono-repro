import type { NoteMidiMessage } from "./NoteMidiMessage.js";
import { VoiceKey } from "../value-objects/VoiceKey.js";

export interface IMidiVoiceKeyFactory {
  create(message: NoteMidiMessage): VoiceKey;
}

export class MidiVoiceKeyFactory implements IMidiVoiceKeyFactory {
  public create(message: NoteMidiMessage): VoiceKey {
    return VoiceKey.create(message.channel.value(), message.note.value());
  }
}
