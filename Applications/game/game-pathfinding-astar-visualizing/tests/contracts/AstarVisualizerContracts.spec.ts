import { describe, expect, it } from "vitest";
import {
  AstarDomEventNames,
  createDefaultSettings,
  createEmptyCellState,
  createIdleStats,
  isValidGridCoordinate,
} from "../../src/contracts/AstarVisualizerContracts.js";
import { AstarVisualizerFixture } from "../fixtures/AstarVisualizerFixture.js";

describe("AstarVisualizerContracts", () => {
  const fixture = new AstarVisualizerFixture();

  it("should create an empty cell state with deterministic defaults", () => {
    const state = createEmptyCellState();

    expect(state).toStrictEqual({
      role: "empty",
      visitState: "unvisited",
      g: null,
      h: null,
      f: null,
      parentDirection: null,
    });
  });

  it("should create idle stats with deterministic defaults", () => {
    const stats = createIdleStats();

    expect(stats).toStrictEqual({
      evaluatedNodes: 0,
      openSize: 0,
      closedSize: 0,
      pathLength: null,
      elapsedMs: 0,
      status: "idle",
    });
  });

  it("should expose typed DOM event names without magic strings in consumers", () => {
    expect(AstarDomEventNames).toMatchObject({
      CellClick: "cell-click",
      CellDrag: "cell-drag",
      Start: "start",
      Pause: "pause",
      Step: "step",
      Reset: "reset",
      SpeedChange: "speed-change",
      PlacementModeChange: "placement-mode-change",
      SettingsChange: "settings-change",
    });
  });

  it("should not expose a legacy cell-mode-change event name", () => {
    expect(Object.values(AstarDomEventNames)).not.toContain("cell-mode-change");
  });

  it("should create deterministic default A* settings", () => {
    const settings = createDefaultSettings();

    expect(settings).toStrictEqual({
      heuristic: "manhattan",
      movementMode: "four-way",
      allowCornerCutting: false,
      weight: 1,
    });
  });

  it("should accept coordinates inside the grid bounds", () => {
    const snapshot = fixture.createSnapshot(3, 3);

    const result = isValidGridCoordinate(snapshot, { row: 2, col: 2 });

    expect(result).toBe(true);
  });

  it("should reject coordinates outside the grid bounds", () => {
    const snapshot = fixture.createSnapshot(3, 3);

    const result = isValidGridCoordinate(snapshot, { row: 3, col: 0 });

    expect(result).toBe(false);
  });

  it("should reject negative coordinates", () => {
    const snapshot = fixture.createSnapshot(3, 3);

    const result = isValidGridCoordinate(snapshot, { row: -1, col: 0 });

    expect(result).toBe(false);
  });
});
