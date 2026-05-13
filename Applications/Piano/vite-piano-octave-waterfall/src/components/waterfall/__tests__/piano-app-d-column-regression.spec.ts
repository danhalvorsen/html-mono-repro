// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { mapTangentNoteToColumn } from "../midi-column-mapper";

describe("piano-app D column mapping regression", () => {
  it("routes tangent D to column 2 and not to column 5", () => {
    const mappedColumn = mapTangentNoteToColumn("D");

    expect(mappedColumn).toBe(2);
    expect(mappedColumn, "Error report: Im playing a D and colum 5 is dropping note").not.toBe(5);
  });
});
