import type { IMidiMessageRouter, INoteLifetimeCoordinator } from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Engine
============================================================================ */

export interface SynthEngineDependencies {
  readonly router: IMidiMessageRouter;
  readonly coordinator: INoteLifetimeCoordinator;
}
