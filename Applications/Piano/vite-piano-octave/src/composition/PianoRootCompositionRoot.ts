import { DefaultPianoRootPlaybackService } from "../application/DefaultPianoRootPlaybackService";
import { DefaultProjectedSongAccordStepMapper } from "../application/DefaultProjectedSongAccordStepMapper";
import { MidiSongProjector } from "../application/MidiSongProjector";
import type { IPianoRootPlaybackService } from "../application/IPianoRootPlaybackService";
import { PianoPlaybackTimingPolicy } from "../application/PianoPlaybackTimingPolicy";
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

