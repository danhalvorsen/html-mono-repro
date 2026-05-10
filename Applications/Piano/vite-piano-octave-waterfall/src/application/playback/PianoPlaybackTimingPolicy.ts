import type { AccordStep } from "../../music/Accords";
import type { ProjectedSongStep } from "../projection/MidiSongProjector";

export class PianoPlaybackTimingPolicy {
  public applyPlaybackSpeed(valueMs: number, speed: number): number {
    const safeSpeed = speed > 0 ? speed : 1;
    return valueMs / safeSpeed;
  }

  public applySignalRate(valueMs: number, rate: number): number {
    const safeRate = rate > 0 ? rate : 1;
    return valueMs / safeRate;
  }

  public getSafePlaybackSpeed(speed: number): number {
    return speed > 0 ? speed : 1;
  }

  public getSafeMidiSignalRate(rate: number): number {
    return rate > 0 ? rate : 1;
  }

  public scaleAccordSteps(steps: readonly AccordStep[], _scale: number): readonly AccordStep[] {
    return steps;
  }

  public normalizeProjectedDuration(steps: readonly ProjectedSongStep[]): readonly ProjectedSongStep[] {
    return steps;
  }
}
