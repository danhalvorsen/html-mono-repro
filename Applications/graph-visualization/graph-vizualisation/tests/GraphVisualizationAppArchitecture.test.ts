import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const thisDir = dirname(fileURLToPath(import.meta.url));
const appFilePath = resolve(thisDir, "../src/GraphVisualizationApp.ts");

async function readAppSource(): Promise<string> {
  return readFile(appFilePath, "utf8");
}

describe("GraphVisualizationApp architecture boundary", () => {
  it("Given GraphVisualizationApp source When orchestration bindings are inspected Then orchestration is delegated to GraphVisualizationCoordinator", async () => {
    const source = await readAppSource();

    expect(source).toContain("type IGraphVisualizationCoordinator");
    expect(source).toContain("new GraphVisualizationCoordinator");
    expect(source).toContain("<graph-visualization-shell>");
    expect(source).toContain("<graph-visualization-toolbar");
    expect(source).toContain("<graph-visualization-workspace");
    expect(source).toContain("<graph-visualization-canvas");
    expect(source).toContain(".layoutAlgorithm=${this.coordinator.layoutAlgorithmName}");
    expect(source).toContain("this.coordinator.setLayout(");
    expect(source).toContain("this.coordinator.setNodeRepresentation(");
  });

  it("Given app source When shell composition is inspected Then view structure and styling are moved to dedicated web component files", async () => {
    const source = await readAppSource();

    expect(source).toContain("./components/GraphVisualizationShell.js");
    expect(source).toContain("./components/GraphVisualizationWorkspace.js");
    expect(source).not.toContain("class=\"masthead\"");
    expect(source).not.toContain("class=\"shell\"");
  });

  it("Given GraphVisualizationApp source When concrete layout controller construction is inspected Then no concrete layout controllers are instantiated in app component", async () => {
    const source = await readAppSource();

    expect(source).not.toContain("new D3ForceLayoutReactiveController");
    expect(source).not.toContain("new D3SpringLayoutReactiveController");
    expect(source).not.toContain("new DGMLLayoutReactiveController");
    expect(source).not.toContain("new GraphSvgSceneFactory");
    expect(source).not.toContain("new GridGraphConstraintEngine");
  });
});
