import type { Normalized, Hertz, IVoiceDefinition, Seconds, IVoiceHandle } from "@monorepo/music-core-synthesizer-contracts";


export interface IVoiceFactoryLike {
  create(request: {
    readonly note: number;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly definition: IVoiceDefinition;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}
