import { describe, expect, it } from "vitest";
import { mapMidiNoteToColumn, mapTangentNoteToColumn } from "../midi-column-mapper";

describe("midi column mapper", () => {
  it("does not map tangent D to column 5", () => {
    expect(mapTangentNoteToColumn("D")).not.toBe(5);
  });

  it("maps tangent D to column 2", () => {
    expect(mapTangentNoteToColumn("D")).toBe(2);
  });

  it("maps tangent Cs to column 1", () => {
    expect(mapTangentNoteToColumn("Cs")).toBe(1);
  });

  it("maps tangent H/B to column 11", () => {
    expect(mapTangentNoteToColumn("H")).toBe(11);
    expect(mapTangentNoteToColumn("B")).toBe(11);
  });

  it("returns null for unknown tangent name", () => {
    expect(mapTangentNoteToColumn("Q")).toBeNull();
  });

  it("maps midi note values by pitch class", () => {
    expect(mapMidiNoteToColumn(62)).toBe(11);
    expect(mapMidiNoteToColumn(74)).toBe(11);
    expect(mapMidiNoteToColumn(50)).toBe(11);
  });
});
