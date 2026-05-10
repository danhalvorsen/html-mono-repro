import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PngHandler } from "../src/application/Png/PngHandler.js";

const svgSource = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="8" y="8" width="48" height="48" fill="black" />
</svg>
`;

describe("PngHandler", () => {
  it("should generate one png file per rotation angle and resolution", async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), "raster-graphics-png-"),
    );

    try {
      const sourceSvgFile = path.join(tempRoot, "valves-ball-valve.svg");
      const outputRoot = path.join(tempRoot, "generated");

      await writeFile(sourceSvgFile, svgSource, "utf8");

      const handler = new PngHandler();

      const filesGenerated = await handler.handle({
        category: "valves",
        itemName: "ball-valve",
        sourceSvgFile,
        outputRoot,
        stepDegrees: 90,
        resolutions: [
          [128, 128],
          [256, 256],
        ],
      });

      expect(filesGenerated).toBe(8);

      const outputFolder = path.join(outputRoot, "valves", "ball-valve");
      const files = (await readdir(outputFolder)).sort();

      expect(files).toEqual([
        "ball-valve-128x128.png",
        "ball-valve-180-128x128.png",
        "ball-valve-180-256x256.png",
        "ball-valve-256x256.png",
        "ball-valve-270-128x128.png",
        "ball-valve-270-256x256.png",
        "ball-valve-90-128x128.png",
        "ball-valve-90-256x256.png",
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});