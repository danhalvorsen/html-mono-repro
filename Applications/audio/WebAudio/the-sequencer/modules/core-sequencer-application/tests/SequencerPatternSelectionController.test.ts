import { describe, expect, it } from "vitest";
import { SequencerPatternSelectionController } from "../src/index.js";

describe("SequencerPatternSelectionController", () => {
  it("should initialize all configured tracks as selected", () => {
    const controller = new SequencerPatternSelectionController([0, 1, 2]);

    expect(controller.projection.tracks).toEqual([
      { trackId: 0, selected: true },
      { trackId: 1, selected: true },
      { trackId: 2, selected: true },
    ]);
  });

  it("should toggle a track to disabled when requested once", async () => {
    const controller = new SequencerPatternSelectionController([0, 1, 2]);

    await controller.toggleTrack(1);

    expect(controller.projection.tracks).toEqual([
      { trackId: 0, selected: true },
      { trackId: 1, selected: false },
      { trackId: 2, selected: true },
    ]);
  });

  it("should toggle a track back to selected when requested twice", async () => {
    const controller = new SequencerPatternSelectionController([0, 1, 2]);

    await controller.toggleTrack(1);
    await controller.toggleTrack(1);

    expect(controller.projection.tracks).toEqual([
      { trackId: 0, selected: true },
      { trackId: 1, selected: true },
      { trackId: 2, selected: true },
    ]);
  });

  it("should notify subscribers with updated projection on toggle", async () => {
    const controller = new SequencerPatternSelectionController([0, 1]);
    const observedStates: boolean[][] = [];

    const unsubscribe = controller.subscribe((projection) => {
      observedStates.push(projection.tracks.map((track) => track.selected));
    });

    await controller.toggleTrack(0);
    unsubscribe();

    expect(observedStates).toEqual([
      [true, true],
      [false, true],
    ]);
  });
});
