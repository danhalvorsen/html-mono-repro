import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Note lifetime
============================================================================ */

export interface IVoiceDefinitionProvider {
  get(): IVoiceDefinition;
}
