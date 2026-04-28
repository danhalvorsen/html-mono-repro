import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const thisDir = dirname(fileURLToPath(import.meta.url));
const toolbarPath = resolve(thisDir, "../src/components/GraphVisualizationToolbar.ts");
const canvasPath = resolve(thisDir, "../src/components/GraphVisualizationCanvas.ts");

async function readSource(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

describe("Slot usability contracts", () => {
  it("Given GraphVisualizationToolbar When slot contracts are inspected Then toolbar exposes dedicated extension slot and emits intent events", async () => {
    const source = await readSource(toolbarPath);

    expect(source).toContain('<slot name="toolbar-after"></slot>');
    expect(source).toContain('"source-graph-change"');
    expect(source).toContain('"layout-change"');
    expect(source).toContain('"node-representation-change"');
  });

  it("Given GraphVisualizationCanvas When slot contracts are inspected Then visualizer labels are projected through a default slot", async () => {
    const source = await readSource(canvasPath);

    expect(source).toContain("<mr-core-graph-visualizer");
    expect(source).toContain("<slot></slot>");
  });

  it("Given slot-based components When internals are inspected Then they avoid querying slotted children directly", async () => {
    const toolbarSource = await readSource(toolbarPath);
    const canvasSource = await readSource(canvasPath);

    expect(toolbarSource).not.toContain("querySelector(\"slot\")");
    expect(canvasSource).not.toContain("querySelector(\"slot\")");
  });
});
