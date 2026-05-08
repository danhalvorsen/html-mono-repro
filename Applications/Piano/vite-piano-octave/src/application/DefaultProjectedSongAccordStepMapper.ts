import type { AccordStep } from "../music/Accords";
import type { IProjectedSongAccordStepMapper } from "./IProjectedSongAccordStepMapper";
import type { ProjectedSongStep } from "./MidiSongProjector";

export class DefaultProjectedSongAccordStepMapper
  implements IProjectedSongAccordStepMapper
{
  public mapByOctave(
    song: readonly ProjectedSongStep[],
    octaveIndex: number
  ): readonly AccordStep[] {
    const filtered = song
      .filter((step) => step.octaveIndex === octaveIndex)
      .sort((left, right) => left.startMs - right.startMs);

    let previousStartMs = 0;
    return filtered.map((step) => {
      const waitBeforeMs = Math.max(0, step.startMs - previousStartMs);
      previousStartMs = step.startMs;

      return {
        notes: [step.note],
        waitBeforeMs,
        holdMs: step.holdMs
      };
    });
  }
}

