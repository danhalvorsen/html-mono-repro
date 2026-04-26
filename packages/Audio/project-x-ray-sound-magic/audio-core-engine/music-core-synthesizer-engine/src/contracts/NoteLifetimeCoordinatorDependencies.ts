import type { IMidiNoteFrequencyMapper } from "@monorepo/music-core-synthesizer-contracts";
import { IVoiceDefinitionProvider } from "./IVoiceDefinitionProvider.js";
import { IVoiceFactoryLike } from "./IVoiceFactoryLike.js";

export interface NoteLifetimeCoordinatorDependencies {
  readonly voiceFactory: IVoiceFactoryLike;
  readonly frequencyMapper: IMidiNoteFrequencyMapper;
  readonly voiceDefinitionProvider: IVoiceDefinitionProvider;
}
