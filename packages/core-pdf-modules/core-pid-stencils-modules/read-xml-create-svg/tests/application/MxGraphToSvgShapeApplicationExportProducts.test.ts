import { describe, expect, it } from "vitest";

import { MxGraphShapeTestFixture } from "../fixtures/MxGraphShapeTestFixture.js";

describe("MxGraphToSvgShapeApplication export SVG files", () => {
  const fixture = new MxGraphShapeTestFixture();

  it("should clean output directory before writing SVG files", async () => {
    const harness = fixture.createApplicationHarness();
    const outputDirectory = "output-svgs";

    harness.writer.setContent(
      `${outputDirectory}/stale.svg`,
      "<svg>stale</svg>",
    );

    await harness.application.exportSvgFiles({
      inputPath: fixture.inputPath,
      outputDirectory,
    });

    const writtenPaths = harness.writer
      .getPaths()
      .map((path) => normalizePath(path));

    expect(harness.outputDirectoryCleaner.getCleanedDirectories()).toEqual([
      outputDirectory,
    ]);

    expect(writtenPaths).not.toContain(`${outputDirectory}/stale.svg`);
    expect(writtenPaths).toContain(
      `${outputDirectory}/pid.feeders-Feeder (Rotary Table).svg`,
    );
    expect(writtenPaths).toContain(
      `${outputDirectory}/pid.feeders-Proportional Feeder.svg`,
    );
  });

  function normalizePath(path: string): string {
    return path.replaceAll("\\", "/");
  }
});