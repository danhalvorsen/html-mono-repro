import { describe, expect, it } from "vitest";
import { DefaultWaterfallNoteWidthPolicy } from "../src/application/DefaultWaterfallNoteWidthPolicy";

describe("DefaultWaterfallNoteWidthPolicy", () => {
  it("should return a displayed width that is same as column width or less", () => {
    const policy = new DefaultWaterfallNoteWidthPolicy();

    const octaveCount = 1;
    const projectedWhiteKeyWidthRatio = 24 / 169; // wider than 1/12 column
    const displayWidth = policy.toDisplayWidthRatio(
      projectedWhiteKeyWidthRatio,
      octaveCount
    );

    const columnWidthRatio = 1 / 12;

    expect(displayWidth).toBeLessThanOrEqual(columnWidthRatio);
    expect(displayWidth).toBeLessThanOrEqual(projectedWhiteKeyWidthRatio);
  });
});

