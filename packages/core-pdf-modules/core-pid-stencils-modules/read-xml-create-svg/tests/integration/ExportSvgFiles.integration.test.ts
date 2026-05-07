import { afterEach, describe, expect, it } from "vitest";
import { readFile, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CompositionRoot } from "../../src/index.js";

describe("export SVG files integration", () => {
  const testFilePath = fileURLToPath(import.meta.url);
  const testRoot = resolve(dirname(testFilePath), "..");
  const inputPath = join(testRoot, "feeders.xml");
  const outputDirectory = join(testRoot, ".tmp-svg");

  afterEach(async () => {
    await rm(outputDirectory, { recursive: true, force: true });
  });

  it("should export one SVG file per shape using root and shape name in the filename", async () => {
    await exportSvgFiles();

    const files = await readdir(outputDirectory);

    expect(files.sort()).toEqual([
      "pid.feeders-Feeder (Rotary Table).svg",
      "pid.feeders-Proportional Feeder (Metering).svg",
      "pid.feeders-Proportional Feeder (Rotary Valve).svg",
      "pid.feeders-Proportional Feeder.svg",
      "pid.feeders-Spray Nozzle.svg",
    ].sort());
  });

  it("should preserve root metadata and original shape name inside the SVG", async () => {
    await exportSvgFiles();

    const svg = await readSvg("pid.feeders-Feeder (Rotary Table).svg");

    expect(svg).toContain('data-root-name="pid.feeders"');
    expect(svg).toContain('data-shape-name="Feeder (Rotary Table)"');
    expect(svg).toContain("<title>Feeder (Rotary Table)</title>");
    expect(svg).toContain(
      '<mxgraph-shape root-name="pid.feeders" name="Feeder (Rotary Table)" w="104.65" h="100" aspect="variable" strokewidth="inherit">',
    );
  });

  it("should keep the XML layer structure as background and foreground SVG groups", async () => {
    await exportSvgFiles();

    const svg = await readSvg("pid.feeders-Proportional Feeder.svg");

    expect(svg).toContain('<g data-layer="background">');
    expect(svg).toContain(
      '<ellipse cx="50" cy="50" rx="50" ry="50" fill="none" stroke="currentColor" stroke-width="inherit" />',
    );

    expect(svg).toContain('<g data-layer="foreground">');
    expect(svg).toContain(
      '<path d="M 10 20 L 90 20 L 10 80 L 90 80" fill="none" stroke="currentColor" stroke-width="inherit" stroke-linejoin="round" />',
    );
  });

  it("should preserve connection metadata in the SVG metadata section", async () => {
    await exportSvgFiles();

    const svg = await readSvg("pid.feeders-Proportional Feeder (Metering).svg");

    expect(svg).toContain("<metadata>");
    expect(svg).toContain("<connections>");
    expect(svg).toContain(
      '<constraint name="NE" perimeter="0" x="1" y="0" />',
    );
    expect(svg).toContain(
      '<constraint name="NW" perimeter="0" x="0" y="0" />',
    );
  });

  async function exportSvgFiles(): Promise<void> {
    await new CompositionRoot()
      .createApplication()
      .exportSvgFiles({ inputPath, outputDirectory });
  }

  async function readSvg(fileName: string): Promise<string> {
    return readFile(join(outputDirectory, fileName), "utf8");
  }
});