import { describe, expect, it } from "vitest";

import { MxGraphShapeTestFixture } from "../fixtures/MxGraphShapeTestFixture.js";

describe("MxGraphToSvgShapeApplication", () => {
  const fixture = new MxGraphShapeTestFixture();

  it("should read mxGraph XML and write svg-shape XML", async () => {
    const harness = fixture.createApplicationHarness();

    await harness.application.convertFile({
      inputPath: fixture.inputPath,
      outputPath: fixture.outputPath
    });

    const output = harness.writer.getContent(fixture.outputPath);

    expect(output).toContain(
      '<svg-shapes name="mxGraph.pid.feeders" root-name="pid.feeders">'
    );
    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Feeder (Rotary Table)"'
    );
    expect(output).toContain(
      '<svg-shape root-name="pid.feeders" name="Proportional Feeder"'
    );
    expect(output).toContain('<g data-layer="background">');
    expect(output).toContain('<g data-layer="foreground">');
    expect(output).toContain(
      '<path d="M 2.33 0 L 102.33 0 M 52.33 0 L 52.33 100 M 62.33 40 A 50 20 0 1 1 42.33 40 M 36.33 37 L 42.33 40 L 36.33 43"'
    );
  });
});