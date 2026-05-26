import { describe, expect, it } from "vitest";
import * as visualizingModule from "./index.js";
import { AstarDomEventNames, AstarVisualizerElement } from "./index.js";
import { AstarGridElement } from "./components/AstarGridElement.js";

describe("README feature gaps (intentional failing tests)", () => {
  it("exports persistence API from package root", () => {
    const moduleMap = visualizingModule as Record<string, unknown>;

    expect(typeof moduleMap.exportGridDocument).toBe("function");
    expect(typeof moduleMap.importGridDocument).toBe("function");
  });

  it("astar-visualizer exposes save/load instance methods", () => {
    const proto = AstarVisualizerElement.prototype as unknown as Record<string, unknown>;

    expect(typeof proto.exportGridDocument).toBe("function");
    expect(typeof proto.importGridDocument).toBe("function");
  });

  it("astar-visualizer import updates grid dimensions from loaded document", () => {
    const proto = AstarVisualizerElement.prototype as unknown as Record<string, unknown>;

    expect(typeof proto.applyLoadedGridDimensions).toBe("function");
  });

  it("declares drag-drop event names in contracts", () => {
    const names = AstarDomEventNames as unknown as Record<string, unknown>;

    expect(names.CellDrop).toBe("cell-drop");
    expect(names.GridLoaded).toBe("grid-loaded");
    expect(names.GridChanged).toBe("grid-changed");
  });

  it("grid supports native drop operations", () => {
    const proto = AstarGridElement.prototype as unknown as Record<string, unknown>;

    expect(typeof proto.handleDragOver).toBe("function");
    expect(typeof proto.handleDrop).toBe("function");
    expect(typeof proto.emitCellDrop).toBe("function");
  });

  it("menu toolbox obstacle selection contract is exported", () => {
    const moduleMap = visualizingModule as Record<string, unknown>;

    expect(typeof moduleMap.AstarToolboxElement).toBe("function");
    expect(typeof moduleMap.ObstacleTypeSelectedEventDetail).toBe("function");
  });

  it("grid-loaded event detail contract is exported", () => {
    const moduleMap = visualizingModule as Record<string, unknown>;

    expect(typeof moduleMap.GridLoadedEventDetail).toBe("function");
  });

  it("grid-changed event detail contract is exported", () => {
    const moduleMap = visualizingModule as Record<string, unknown>;

    expect(typeof moduleMap.GridChangedEventDetail).toBe("function");
  });

  it("visualizer supports obstacle metadata projection path", () => {
    const proto = AstarVisualizerElement.prototype as unknown as Record<string, unknown>;

    expect(typeof proto.applyObstacleMetadata).toBe("function");
  });
});
