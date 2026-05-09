import type { AccordStep } from "../music/Accords";
import type { ProjectedSongStep } from "./MidiSongProjector";

export class DefaultProjectedSongAccordStepMapper {
  public mapByOctave(_steps: readonly ProjectedSongStep[], _octaveIndex: number): readonly AccordStep[] {
    return [];
  }
}
