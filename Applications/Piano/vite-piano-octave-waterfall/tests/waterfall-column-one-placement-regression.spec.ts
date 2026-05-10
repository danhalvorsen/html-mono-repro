import { describe, expect, it } from "vitest";
import { DefaultWaterfallColumnLayout } from "../src/application/DefaultWaterfallColumnLayout";
import { DefaultFallingColumnMapper } from "../src/application/DefaultFallingColumnMapper";

class WaterfallPlacementModel {
  public constructor(private readonly layout: DefaultWaterfallColumnLayout) {}

  public calculateLeftPercent(column: number): number {
    const ratio = this.layout.getColumnStartRatio(column, 1);
    if (ratio === null) {
      throw new Error(`Expected start ratio for column ${column}.`);
    }
    return ratio * 100;
  }

  public calculateWidthPercent(column: number): number {
    const ratio = this.layout.getColumnWidthRatio(column, 1);
    if (ratio === null) {
      throw new Error(`Expected width ratio for column ${column}.`);
    }
    return ratio * 100;
  }
}

describe("Waterfall column 1 placement regression", () => {
  it("should keep a note mapped to column 1 fully inside column 1 bounds", () => {
    const mapper = new DefaultFallingColumnMapper();
    const layout = new DefaultWaterfallColumnLayout();
    const model = new WaterfallPlacementModel(layout);

    const mappedColumn = mapper.toColumn("C", 0);
    expect(mappedColumn).toBe(0);

    const widthPercent = model.calculateWidthPercent(mappedColumn);
    const leftPercent = model.calculateLeftPercent(mappedColumn);
    const rightPercent = leftPercent + widthPercent;

    const columnLeftRatio = layout.getColumnStartRatio(mappedColumn, 1);
    const columnWidthRatio = layout.getColumnWidthRatio(mappedColumn, 1);
    if (columnLeftRatio === null || columnWidthRatio === null) {
      throw new Error("Expected ratios for mapped column.");
    }

    const columnLeftPercent = columnLeftRatio * 100;
    const columnRightPercent = (columnLeftRatio + columnWidthRatio) * 100;

    expect(leftPercent).toBeGreaterThanOrEqual(columnLeftPercent);
    expect(rightPercent).toBeLessThanOrEqual(columnRightPercent);
  });
});
