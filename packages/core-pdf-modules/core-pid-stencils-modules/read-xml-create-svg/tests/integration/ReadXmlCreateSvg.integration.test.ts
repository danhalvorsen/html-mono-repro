import { afterEach, describe, expect, it } from "vitest";
import { mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CompositionRoot } from "../../src/index.js";

describe("read-xml-create-svg integration", () => {
  const testFilePath = fileURLToPath(import.meta.url);
  const testRoot = resolve(dirname(testFilePath), "..");
  const inputPath = join(testRoot, "feeders.xml");
  const outputDirectory = join(testRoot, ".tmp");
  const outputPath = join(outputDirectory, "feeders.svg-shapes.xml");

  afterEach(async () => {
    await rm(outputDirectory, { recursive: true, force: true });
  });

  it("should convert the feeders XML file into svg-shape XML with root metadata", async () => {
    await convert();

    const output = await readOutput();

    expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(output).toContain(
      '<svg-shapes name="mxGraph.pid.feeders" root-name="pid.feeders">',
    );

    const shapeTags = output.match(/<svg-shape root-name=/g) ?? [];
    expect(shapeTags).toHaveLength(5);

    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Feeder (Rotary Table)" w="104.65" h="100" aspect="variable" strokewidth="inherit">',
    );
    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Proportional Feeder" w="100" h="100" aspect="variable" strokewidth="inherit">',
    );
    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Proportional Feeder (Metering)" w="300" h="50" aspect="variable" strokewidth="inherit">',
    );
    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Proportional Feeder (Rotary Valve)" w="100" h="100" aspect="variable" strokewidth="inherit">',
    );
    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Spray Nozzle" w="100" h="50" aspect="variable" strokewidth="inherit">',
    );
  });

  it("should preserve connection points from feeders XML", async () => {
    await convert();

    const output = await readOutput();

    expect(output).toContain(
      '<constraint name="N" perimeter="0" x="0.5" y="0" />',
    );
    expect(output).toContain(
      '<constraint name="S" perimeter="0" x="0.5" y="1" />',
    );
    expect(output).toContain(
      '<constraint name="NE" perimeter="0" x="1" y="0" />',
    );
    expect(output).toContain(
      '<constraint name="NW" perimeter="0" x="0" y="0" />',
    );
  });

  it("should preserve representative path, arc, close and ellipse geometry inside XML-like SVG layers", async () => {
    await convert();

    const output = await readOutput();

    expect(output).toContain('<g data-layer="background">');
    expect(output).toContain('<g data-layer="foreground">');

    expect(output).toContain(
      '<path d="M 2.33 0 L 102.33 0 M 52.33 0 L 52.33 100 M 62.33 40 A 50 20 0 1 1 42.33 40 M 36.33 37 L 42.33 40 L 36.33 43" fill="none" stroke="currentColor" stroke-width="inherit" />',
    );

    expect(output).toContain(
      '<path d="M 80 0 A 40 40 0 1 1 0 0 L 300 0 A 40 40 0 1 1 220 0 Z M 150 1 L 180 50 L 120 50 Z" fill="none" stroke="currentColor" stroke-width="inherit" />',
    );

    expect(output).toContain(
      '<ellipse cx="50" cy="50" rx="50" ry="50" fill="none" stroke="currentColor" stroke-width="inherit" />',
    );

    expect(output).toContain(
      '<ellipse cx="50" cy="50" rx="5" ry="5" fill="currentColor" stroke="currentColor" stroke-width="inherit" />',
    );

    expect(output).toContain(
      '<path d="M 0 50 L 50 0 L 100 50 M 50 0 L 50 50" fill="none" stroke="currentColor" stroke-width="inherit" />',
    );
  });

  async function convert(): Promise<void> {
    await mkdir(outputDirectory, { recursive: true });

    await new CompositionRoot()
      .createApplication()
      .convertFile({ inputPath, outputPath });
  }

  async function readOutput(): Promise<string> {
    return readFile(outputPath, "utf8");
  }
});