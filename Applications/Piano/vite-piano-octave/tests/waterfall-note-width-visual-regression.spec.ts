import { describe, expect, it } from "vitest";
import { DefaultWaterfallColumnLayout } from "../src/application/DefaultWaterfallColumnLayout";

class WaterfallVisualWidthModel {
  public calculateColumnWidthPx(containerWidthPx: number, widthRatio: number): number {
    return containerWidthPx * widthRatio;
  }

  public calculateRenderedNoteWidthPx(
    containerWidthPx: number,
    widthRatio: number
  ): number {
    // Mirrors current rendering expression in piano-waterfall.ts:
    // width: max(0px, calc(${widthPercent}% - 2px))
    const columnWidthPx = this.calculateColumnWidthPx(containerWidthPx, widthRatio);
    return Math.max(0, columnWidthPx - 2);
  }
}

describe("Waterfall note width visual regression", () => {
  it("should keep falling note width less than or equal to its mapped column width", () => {
    const model = new WaterfallVisualWidthModel();
    const layout = new DefaultWaterfallColumnLayout();
    const narrowContainerWidthPx = 20;
    const octaveCount = 1;
    const columnIndex = 1; // black key column (narrow)
    const widthRatio = layout.getColumnWidthRatio(columnIndex, octaveCount);
    if (widthRatio === null) {
      throw new Error("Expected a width ratio for column index 1.");
    }

    const columnWidthPx = model.calculateColumnWidthPx(narrowContainerWidthPx, widthRatio);
    const noteWidthPx = model.calculateRenderedNoteWidthPx(
      narrowContainerWidthPx,
      widthRatio
    );

    expect(noteWidthPx).toBeLessThanOrEqual(columnWidthPx);
  });
});
