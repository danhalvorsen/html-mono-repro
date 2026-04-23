import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { IPdfFragment } from "@monorepo/core-pdf-domain";
import { PdfWriter } from "../../../core-pdf-writer/src/index.js";
import { PdfFragmentWriter } from "../../../core-pdf-parser-adapter/src/code.js";
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

    const writer = new PdfWriter<IPdfFragment>(new PdfFragmentWriter());
    const sourcePdfBinary = new Uint8Array(await readFile(sourcePdfPath));
    const rectangles: IPdfFragment[] = document.fragments.map((f) => ({
      kind: "rectangle",
      pageNumber: f.pageNumber,
      boundingBox: {
        position: {
          x: f.boundingBox.position.x,
          y: f.boundingBox.position.y,
        },
        width: f.boundingBox.width,
        height: f.boundingBox.height,
      },
    }));
    const outputBinary = await writer.write(sourcePdfBinary, rectangles);
    await writeFile(outputPdfPath, outputBinary);

    expect(existsSync(outputPdfPath)).toBe(true);
  });
});
