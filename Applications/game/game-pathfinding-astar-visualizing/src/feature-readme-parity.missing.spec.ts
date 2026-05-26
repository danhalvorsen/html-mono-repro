import { describe, expect, it } from "vitest";
import * as moduleRoot from "./index.js";
import { AstarDomEventNames, AstarVisualizerElement } from "./index.js";
import { AstarGridElement } from "./components/AstarGridElement.js";

function hasFn(target: object, name: string): boolean {
  return typeof (target as Record<string, unknown>)[name] === "function";
}

describe("README parity gaps (intentional failing tests)", () => {
  it("exports library persistence functions", () => {
    const api = moduleRoot as Record<string, unknown>;
    expect(typeof api.exportGridDocument).toBe("function");
    expect(typeof api.importGridDocument).toBe("function");
  });

  it("exports toolbox component for obstacle drag source", () => {
    const api = moduleRoot as Record<string, unknown>;
    expect(typeof api.AstarToolboxElement).toBe("function");
  });

  it("declares drag/drop and load/change event names", () => {
    const names = AstarDomEventNames as unknown as Record<string, unknown>;
    expect(names.CellDrop).toBe("cell-drop");
    expect(names.GridLoaded).toBe("grid-loaded");
    expect(names.GridChanged).toBe("grid-changed");
    expect(names.ObstacleTypeSelected).toBe("obstacle-type-selected");
  });

  it("grid handles native drag/drop lifecycle", () => {
    const proto = AstarGridElement.prototype;
    expect(hasFn(proto, "handleDragOver")).toBe(true);
    expect(hasFn(proto, "handleDrop")).toBe(true);
    expect(hasFn(proto, "emitCellDrop")).toBe(true);
  });

  it("visualizer exposes import/export APIs", () => {
    const proto = AstarVisualizerElement.prototype;
    expect(hasFn(proto, "exportGridDocument")).toBe(true);
    expect(hasFn(proto, "importGridDocument")).toBe(true);
  });

  it("visualizer load applies rows/cols from document", () => {
    const proto = AstarVisualizerElement.prototype;
    expect(hasFn(proto, "applyLoadedGridDimensions")).toBe(true);
  });

  it("visualizer emits grid-loaded and grid-changed events", () => {
    const proto = AstarVisualizerElement.prototype;
    expect(hasFn(proto, "emitGridLoaded")).toBe(true);
    expect(hasFn(proto, "emitGridChanged")).toBe(true);
  });

  it("visualizer supports obstacle metadata application", () => {
    const proto = AstarVisualizerElement.prototype;
    expect(hasFn(proto, "applyObstacleMetadata")).toBe(true);
  });
});
