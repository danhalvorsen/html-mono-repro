import { describe, expect, it } from "vitest";
import {
  AstarDomEventNames,
  createEmptyCellState,
  createIdleStats,
  type AstarEngineStepEvent,
  type AstarSettings,
  type CellDragEventDetail,
  type CellClickEventDetail,
  type GridCellPatch,
  type GridSnapshot,
  type PlacementModeChangeEventDetail,
  type ResetEventDetail,
  type SettingsChangeEventDetail,
  type SpeedChangeEventDetail,
} from "../../src/contracts/AstarVisualizerContracts.js";

describe("Feature: A* visualizer structural contracts", () => {
  describe("Scenario: Define grid cell state", () => {
    it("should expose the minimal deterministic default CellState contract", () => {
      const cell = createEmptyCellState();

      expect(cell).toStrictEqual({
        role: "empty",
        visitState: "unvisited",
        g: null,
        h: null,
        f: null,
        parentDirection: null,
      });
    });
  });

  describe("Scenario: Define immutable grid snapshots", () => {
    it("should represent rows first and columns second", () => {
      const snapshot: GridSnapshot = [
        [
          createEmptyCellState(),
          {
            ...createEmptyCellState(),
            role: "goal",
          },
        ],
      ];

      expect(snapshot[0]?.[0]?.role).toBe("empty");
      expect(snapshot[0]?.[1]?.role).toBe("goal");
    });
  });

  describe("Scenario: Define grid diffs", () => {
    it("should define row and col as required patch coordinates", () => {
      const patch: GridCellPatch = {
        row: 1,
        col: 2,
      };

      expect(patch).toStrictEqual({
        row: 1,
        col: 2,
      });
    });

    it("should allow missing patch fields to represent unchanged values", () => {
      const patch: GridCellPatch = {
        row: 1,
        col: 2,
        visitState: "open",
      };

      expect(patch.role).toBeUndefined();
      expect(patch.visitState).toBe("open");
    });

    it("should allow nullable patch fields to clear values", () => {
      const patch: GridCellPatch = {
        row: 1,
        col: 2,
        g: null,
        h: null,
        f: null,
        parentDirection: null,
      };

      expect(patch.g).toBeNull();
      expect(patch.h).toBeNull();
      expect(patch.f).toBeNull();
      expect(patch.parentDirection).toBeNull();
    });
  });

  describe("Scenario: Define cell click event payload", () => {
    it("should contain only row and col", () => {
      const detail: CellClickEventDetail = {
        row: 3,
        col: 4,
      };

      expect(detail).toStrictEqual({
        row: 3,
        col: 4,
      });
      expect(Object.keys(detail).sort()).toStrictEqual(["col", "row"]);
    });
  });

  describe("Scenario: Define cell drag event payload", () => {
    it("should contain row, col, and drag phase", () => {
      const detail: CellDragEventDetail = {
        row: 3,
        col: 4,
        phase: "move",
      };

      expect(detail).toStrictEqual({
        row: 3,
        col: 4,
        phase: "move",
      });
    });
  });

  describe("Scenario: Define playback control event names", () => {
    it("should expose exact DOM event names through constants", () => {
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
  });

  describe("Scenario: Define reset event payload", () => {
    it("should define reset preservation flags", () => {
      const detail: ResetEventDetail = {
        preserveWalls: true,
        preserveStartAndGoal: true,
      };

      expect(detail).toStrictEqual({
        preserveWalls: true,
        preserveStartAndGoal: true,
      });
    });
  });

  describe("Scenario: Define speed change event payload", () => {
    it("should define a positive millisecondsPerStep value", () => {
      const detail: SpeedChangeEventDetail = {
        millisecondsPerStep: 50,
      };

      expect(detail.millisecondsPerStep).toBeGreaterThan(0);
    });
  });

  describe("Scenario: Define placement mode event payload", () => {
    it("should define the selected placement mode", () => {
      const detail: PlacementModeChangeEventDetail = {
        mode: "wall",
      };

      expect(detail).toStrictEqual({
        mode: "wall",
      });
    });
  });

  describe("Scenario: Define settings change event payload", () => {
    it("should define the full settings object", () => {
      const settings: AstarSettings = {
        heuristic: "manhattan",
        movementMode: "four-way",
        allowCornerCutting: false,
        weight: 1,
      };

      const detail: SettingsChangeEventDetail = {
        settings,
      };

      expect(detail).toStrictEqual({
        settings: {
          heuristic: "manhattan",
          movementMode: "four-way",
          allowCornerCutting: false,
          weight: 1,
        },
      });
    });
  });

  describe("Scenario: Define engine step event contract", () => {
    it("should define all required engine step fields", () => {
      const step: AstarEngineStepEvent = {
        sequence: 1,
        kind: "node-opened",
        coordinate: {
          row: 1,
          col: 2,
        },
        current: {
          row: 1,
          col: 1,
        },
        costs: {
          g: 10,
          h: 20,
          f: 30,
        },
        parent: {
          row: 1,
          col: 1,
        },
        path: null,
        evaluatedNodes: 1,
        openSize: 3,
        closedSize: 0,
        elapsedMs: 5,
      };

      expect(step).toStrictEqual({
        sequence: 1,
        kind: "node-opened",
        coordinate: {
          row: 1,
          col: 2,
        },
        current: {
          row: 1,
          col: 1,
        },
        costs: {
          g: 10,
          h: 20,
          f: 30,
        },
        parent: {
          row: 1,
          col: 1,
        },
        path: null,
        evaluatedNodes: 1,
        openSize: 3,
        closedSize: 0,
        elapsedMs: 5,
      });
    });
  });

  describe("Scenario: Define successful completion marker", () => {
    it("should use path-found with an ordered path", () => {
      const step: AstarEngineStepEvent = {
        sequence: 10,
        kind: "path-found",
        coordinate: null,
        current: {
          row: 2,
          col: 2,
        },
        costs: null,
        parent: null,
        path: [
          {
            row: 0,
            col: 0,
          },
          {
            row: 1,
            col: 1,
          },
          {
            row: 2,
            col: 2,
          },
        ],
        evaluatedNodes: 8,
        openSize: 0,
        closedSize: 8,
        elapsedMs: 12,
      };

      expect(step.kind).toBe("path-found");
      expect(step.path).toStrictEqual([
        {
          row: 0,
          col: 0,
        },
        {
          row: 1,
          col: 1,
        },
        {
          row: 2,
          col: 2,
        },
      ]);
    });
  });

  describe("Scenario: Define failed completion marker", () => {
    it("should use no-path with null path", () => {
      const step: AstarEngineStepEvent = {
        sequence: 10,
        kind: "no-path",
        coordinate: null,
        current: null,
        costs: null,
        parent: null,
        path: null,
        evaluatedNodes: 8,
        openSize: 0,
        closedSize: 8,
        elapsedMs: 12,
      };

      expect(step.kind).toBe("no-path");
      expect(step.path).toBeNull();
    });
  });

  describe("Scenario: Define statistics model", () => {
    it("should expose the minimal idle statistics shape", () => {
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
  });
});
