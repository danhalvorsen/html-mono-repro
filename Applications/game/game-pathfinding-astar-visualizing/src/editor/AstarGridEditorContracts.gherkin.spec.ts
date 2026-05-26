import { describe, expect, it } from "vitest";
import {
  AstarGridEditorEventNames,
  type CellDropEventDetail,
  type GridChangedEventDetail,
  type GridLoadedEventDetail,
  type ToolboxSelectEventDetail,
} from "./AstarGridEditorContracts.js";
import { AstarGridEditorFixture } from "./tests/fixtures/AstarGridEditorFixture.js";

describe("Feature: Editable A* grid visualizer event contracts", () => {
  const fixture = new AstarGridEditorFixture();

  describe("Scenario: Select obstacle type from toolbox", () => {
    it("should define toolbox-select with obstacleType", () => {
      const detail: ToolboxSelectEventDetail = {
        obstacleType: "weighted",
      };

      expect(detail).toStrictEqual({
        obstacleType: "weighted",
      });
    });
  });

  describe("Scenario: Drag and drop obstacle from toolbox", () => {
    it("should define cell-drop with row, col, and obstacleType", () => {
      const detail: CellDropEventDetail = {
        row: 2,
        col: 3,
        obstacleType: "wall",
      };

      expect(detail).toStrictEqual({
        row: 2,
        col: 3,
        obstacleType: "wall",
      });
    });
  });

  describe("Scenario: Load grid from JSON", () => {
    it("should define grid-loaded with a persisted document", () => {
      const document = fixture.createValidDocument();

      const detail: GridLoadedEventDetail = {
        document,
      };

      expect(detail).toStrictEqual({
        document,
      });
    });
  });

  describe("Scenario: Notify algorithm of grid changes", () => {
    it("should define grid-changed with the derived runtime snapshot", () => {
      const snapshot = fixture.createEmptySnapshot();

      const detail: GridChangedEventDetail = {
        snapshot,
      };

      expect(detail).toStrictEqual({
        snapshot,
      });
    });
  });

  describe("Scenario: Minimal editor events", () => {
    it("should expose exact editor event names", () => {
      expect(AstarGridEditorEventNames).toStrictEqual({
        CellDrop: "cell-drop",
        ToolboxSelect: "toolbox-select",
        GridLoaded: "grid-loaded",
        GridChanged: "grid-changed",
      });
    });
  });
});
