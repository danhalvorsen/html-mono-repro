import { DefaultPianoRootPlaybackService } from "../application/playback/DefaultPianoRootPlaybackService";
import { DefaultProjectedSongAccordStepMapper } from "../application/projection/DefaultProjectedSongAccordStepMapper";
import { MidiSongProjector } from "../application/projection/MidiSongProjector";
import type { IPianoRootPlaybackService } from "../application/playback/IPianoRootPlaybackService";
import { PianoPlaybackTimingPolicy } from "../application/playback/PianoPlaybackTimingPolicy";
import { WindowTaskScheduler } from "../infrastructure/WindowTaskScheduler";

export interface IPianoRootCompositionRoot {
  composePlaybackService(): IPianoRootPlaybackService;
}

export class PianoRootCompositionRoot implements IPianoRootCompositionRoot {
  public composePlaybackService(): IPianoRootPlaybackService {
    return new DefaultPianoRootPlaybackService({
      midiSongProjector: new MidiSongProjector(),
      projectedSongAccordStepMapper: new DefaultProjectedSongAccordStepMapper(),
      timingPolicy: new PianoPlaybackTimingPolicy(),
      taskScheduler: new WindowTaskScheduler()
    });
  }
}

