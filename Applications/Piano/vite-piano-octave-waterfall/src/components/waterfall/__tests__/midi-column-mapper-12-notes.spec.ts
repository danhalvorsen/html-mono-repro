import { describe, expect, it } from "vitest";
import { mapTangentNoteToColumn } from "../midi-column-mapper";

describe("midi column mapper - 12 note mapping", () => {
  it("maps C to column 0", () => {
    expect(mapTangentNoteToColumn("C")).toBe(0);
  });

  it("maps C# to column 1", () => {
    expect(mapTangentNoteToColumn("C#")).toBe(1);
  });

  it("maps D to column 2", () => {
    expect(mapTangentNoteToColumn("D")).toBe(2);
  });

  it("maps D# to column 3", () => {
    expect(mapTangentNoteToColumn("D#")).toBe(3);
  });

  it("maps E to column 4", () => {
    expect(mapTangentNoteToColumn("E")).toBe(4);
  });

  it("maps F to column 5", () => {
    expect(mapTangentNoteToColumn("F")).toBe(5);
  });

  it("maps F# to column 6", () => {
    expect(mapTangentNoteToColumn("F#")).toBe(6);
  });

  it("maps G to column 7", () => {
    expect(mapTangentNoteToColumn("G")).toBe(7);
  });

  it("maps G# to column 8", () => {
    expect(mapTangentNoteToColumn("G#")).toBe(8);
  });

  it("maps A to column 9", () => {
    expect(mapTangentNoteToColumn("A")).toBe(9);
  });

  it("maps A# to column 10", () => {
    expect(mapTangentNoteToColumn("A#")).toBe(10);
  });

  it("maps B to column 11", () => {
    expect(mapTangentNoteToColumn("B")).toBe(11);
  });
});
