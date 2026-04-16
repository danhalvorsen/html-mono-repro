import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PdfBoundingBoxOverlayWriter } from "../../../core-pdf-writer/src/index.js";
import { PidFragmentsJsonFileRepository } from "./PidFragmentsJsonFileRepository.js";

const thisDirectory = dirname(fileURLToPath(import.meta.url));
const sourcePdfPath = join(thisDirectory, "PID.pdf");
const sourceJsonPath = join(thisDirectory, "PID.fragments.json");
const outputPdfPath = join(thisDirectory, "PID.with-bounding-boxes.pdf");

describe("PID bounding-box overlay integration", () => {
  it("reads PID.fragments.json and draws fragment rectangles on PID.pdf", async () => {
    expect(existsSync(sourcePdfPath)).toBe(true);
    expect(existsSync(sourceJsonPath)).toBe(true);

    const repository = new PidFragmentsJsonFileRepository(sourceJsonPath);
    const document = await repository.read();

    expect(document.fragments.length).toBeGreaterThan(0);

    const writer = new PdfBoundingBoxOverlayWriter();
    await writer.write({
      sourcePdfPath,
      outputPdfPath,
      rectangles: document.fragments.map((f) => ({
        pageNumber: f.pageNumber,
        x: f.boundingBox.position.x,
        y: f.boundingBox.position.y,
        width: f.boundingBox.width,
        height: f.boundingBox.height,
      })),
    });

    expect(existsSync(outputPdfPath)).toBe(true);
  });
});
