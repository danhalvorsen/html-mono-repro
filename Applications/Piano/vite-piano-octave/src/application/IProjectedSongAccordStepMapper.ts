import type { AccordStep } from "../music/Accords";
import type { ProjectedSongStep } from "./MidiSongProjector";

export interface IProjectedSongAccordStepMapper {
  mapByOctave(
    song: readonly ProjectedSongStep[],
    octaveIndex: number
  ): readonly AccordStep[];
}

