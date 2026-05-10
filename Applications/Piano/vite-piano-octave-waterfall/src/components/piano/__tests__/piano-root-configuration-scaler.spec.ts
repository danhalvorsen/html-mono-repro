import { describe, expect, it } from "vitest";
import { PianoRootConfigurationFactory } from "../PianoRootConfiguration";
import { PianoRootConfigurationScaler } from "../PianoRootConfigurationScaler";

function createSourceConfiguration() {
  return new PianoRootConfigurationFactory().create({
    octaveCount: 2,
    rootPosition: { x: 10, y: 20 },
    octaveSize: { x: 100, y: 50 },
    octaveStartPosition: { x: 7, y: 11 },
    octaveGap: 4,
    waterfallPosition: { x: 3, y: 5 },
    waterfallHeightRatioToOctaveHeight: 2,
    maxSimultaneousOctaves: 2,
    midiTempoBpm: 130,
    playbackSpeed: 1,
    midiSignalRate: 1,
  });
}

describe("PianoRootConfigurationScaler", () => {
  it("scales root position and size", () => {
    const source = createSourceConfiguration();
    const scaled = new PianoRootConfigurationScaler().scale(source, {
      x: 2,
      y: 3,
    });

    expect(scaled.root.position).toEqual({ x: 20, y: 60 });
    expect(scaled.root.size).toEqual({
      x: source.root.size.x * 2,
      y: source.root.size.y * 3,
    });
  });

  it("scales stage layout values", () => {
    const source = createSourceConfiguration();
    const scaled = new PianoRootConfigurationScaler().scale(source, {
      x: 2,
      y: 3,
    });

    expect(scaled.stage.octaveSize).toEqual({ x: 200, y: 150 });
    expect(scaled.stage.waterfallSize).toEqual({
      x: source.stage.waterfallSize.x * 2,
      y: source.stage.waterfallSize.y * 3,
    });
    expect(scaled.stage.waterfallPosition).toEqual({ x: 6, y: 15 });
    expect(scaled.stage.octaveStartPosition).toEqual({ x: 14, y: 33 });
    expect(scaled.stage.octaveGap).toBe(8);
  });

  it("scales waterfall columns and played notes", () => {
    const source = createSourceConfiguration();
    const scaled = new PianoRootConfigurationScaler().scale(source, {
      x: 2,
      y: 3,
    });

    const sourceColumn = source.waterfall.columns[1];
    const scaledColumn = scaled.waterfall.columns[1];

    expect(scaled.waterfall.position).toEqual({ x: 6, y: 15 });
    expect(scaled.waterfall.size).toEqual({
      x: source.waterfall.size.x * 2,
      y: source.waterfall.size.y * 3,
    });

    expect(scaledColumn.position).toEqual({
      x: sourceColumn.position.x * 2,
      y: sourceColumn.position.y * 3,
    });

    expect(scaledColumn.size).toEqual({
      x: sourceColumn.size.x * 2,
      y: sourceColumn.size.y * 3,
    });

    expect(scaledColumn.playedNote.size).toEqual({
      x: sourceColumn.playedNote.size.x * 2,
      y: sourceColumn.playedNote.size.y * 3,
    });

    expect(scaledColumn.playedNote.speedPxPerSecond).toBe(
      sourceColumn.playedNote.speedPxPerSecond * 3
    );
  });

  it("scales octave position and size", () => {
    const source = createSourceConfiguration();
    const scaled = new PianoRootConfigurationScaler().scale(source, {
      x: 2,
      y: 3,
    });

    const sourceOctave = source.octaves[1];
    const scaledOctave = scaled.octaves[1];

    expect(scaledOctave.position).toEqual({
      x: sourceOctave.position.x * 2,
      y: sourceOctave.position.y * 3,
    });

    expect(scaledOctave.size).toEqual({
      x: sourceOctave.size.x * 2,
      y: sourceOctave.size.y * 3,
    });
  });

  it("does not scale normalized geometry, polygon points, or tangent layout percentages", () => {
    const source = createSourceConfiguration();
    const scaled = new PianoRootConfigurationScaler().scale(source, {
      x: 2,
      y: 3,
    });

    const sourceOctave = source.octaves[0];
    const scaledOctave = scaled.octaves[0];

    expect(scaledOctave.geometry).toBe(sourceOctave.geometry);
    expect(scaledOctave.viewBox).toBe(sourceOctave.viewBox);
    expect(scaledOctave.tangents).toBe(sourceOctave.tangents);
    expect(scaledOctave.tangent.C).toBe(sourceOctave.tangent.C);
    expect(scaledOctave.tangent.C.polygon.points).toBe(
      sourceOctave.tangent.C.polygon.points
    );
    expect(scaledOctave.tangent.C.layout).toBe(sourceOctave.tangent.C.layout);
  });

  it("uses scale 1 for invalid scale values", () => {
    const source = createSourceConfiguration();
    const scaled = new PianoRootConfigurationScaler().scale(source, {
      x: 0,
      y: Number.NaN,
    });

    expect(scaled.root.position).toEqual(source.root.position);
    expect(scaled.root.size).toEqual(source.root.size);
  });
});