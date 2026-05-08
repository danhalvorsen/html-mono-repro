import type { IWaterfallNoteWidthPolicy } from "./IWaterfallNoteWidthPolicy";

export class DefaultWaterfallNoteWidthPolicy
  implements IWaterfallNoteWidthPolicy
{
  private static readonly COLUMNS_PER_OCTAVE = 12;
  private static readonly MIN_VISIBLE_WIDTH_RATIO = 0.001;

  public toDisplayWidthRatio(
    projectedWidthRatio: number,
    octaveCount: number
  ): number {
    if (!Number.isFinite(projectedWidthRatio) || projectedWidthRatio <= 0) {
      return DefaultWaterfallNoteWidthPolicy.MIN_VISIBLE_WIDTH_RATIO;
    }

    if (!Number.isInteger(octaveCount) || octaveCount <= 0) {
      return DefaultWaterfallNoteWidthPolicy.MIN_VISIBLE_WIDTH_RATIO;
    }

    const columnWidthRatio =
      1 / (octaveCount * DefaultWaterfallNoteWidthPolicy.COLUMNS_PER_OCTAVE);

    return Math.max(
      DefaultWaterfallNoteWidthPolicy.MIN_VISIBLE_WIDTH_RATIO,
      Math.min(projectedWidthRatio, columnWidthRatio)
    );
  }
}

