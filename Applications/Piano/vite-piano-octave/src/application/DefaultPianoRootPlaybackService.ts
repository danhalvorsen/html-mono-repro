import type { IPianoOctavePlayback } from "./IPianoOctavePlayback";
import type { IPianoRootPlaybackService } from "./IPianoRootPlaybackService";
import type { ITaskScheduler } from "./ITaskScheduler";
import type { MidiSongProjector } from "./MidiSongProjector";
import type { DefaultProjectedSongAccordStepMapper } from "./DefaultProjectedSongAccordStepMapper";
import type { PianoPlaybackTimingPolicy } from "./PianoPlaybackTimingPolicy";

export class DefaultPianoRootPlaybackService implements IPianoRootPlaybackService {
  public constructor(
    private readonly _deps: {
      readonly midiSongProjector: MidiSongProjector;
      readonly projectedSongAccordStepMapper: DefaultProjectedSongAccordStepMapper;
      readonly timingPolicy: PianoPlaybackTimingPolicy;
      readonly taskScheduler: ITaskScheduler;
    },
  ) {}

  public playSong(_octaves: readonly IPianoOctavePlayback[]): void {
    // Intentionally minimal (KISS): playback orchestration can be rebuilt when needed.
  }
}
