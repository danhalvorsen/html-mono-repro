import type { INoteLifetimeCoordinator } from "@monorepo/music-core-synthesizer-contracts";
import { IAudioTimeProvider } from "./IAudioTimeProvider.js";

/* ============================================================================
   MIDI routing
============================================================================ */

export interface MidiMessageRouterDependencies {
  readonly timeProvider: IAudioTimeProvider;
  readonly coordinator: INoteLifetimeCoordinator;
}
