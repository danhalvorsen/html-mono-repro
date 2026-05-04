// NEW FILE ONLY:
// packages/core-pdf-reader/tests/PID/Graphics/PID.graphics-fragments.test.ts

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FragmentKinds,
  type IPdfRectangleFragment,
  type PdfFragment,
} from "@monorepo/core-pdf-domain";
import { describe, expect, it } from "vitest";

import { PdfEngine } from "../../../src/engine/PdfEngine.js";

const TestDirectory = dirname(fileURLToPath(import.meta.url));

const PdfPath = join(TestDirectory, "..", "PID.pdf");
const OutputDirectory = join(TestDirectory, "output");
const OutputJsonPath = join(OutputDirectory, "PID.graphics-fragments.json");

interface GraphicsFragmentDto {
  readonly index: number;
  readonly kind: typeof FragmentKinds.Rectangle;
  readonly pageNumber: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly area: number;
}

interface GraphicsFragmentReport {
  readonly pdfPath: string;
  readonly totalFragments: number;
  readonly textFragments: number;
  readonly imageFragments: number;
  readonly graphicsFragments: number;
  readonly graphics: readonly GraphicsFragmentDto[];
}

function isGraphicsFragment(
  fragment: PdfFragment,
): fragment is IPdfRectangleFragment {
  return fragment.kind === FragmentKinds.Rectangle;
}

function toGraphicsDto(
  fragment: IPdfRectangleFragment,
  index: number,
): GraphicsFragmentDto {
  const { position, width, height } = fragment.boundingBox;

  return Object.freeze({
    index,
    kind: FragmentKinds.Rectangle,
    pageNumber: fragment.pageNumber,
    x: position.x,
    y: position.y,
    width,
    height,
    area: width * height,
  });
}

describe("PID.pdf graphics fragments", () => {
  it("should find vector graphics fragments from PID.pdf", async () => {
    await mkdir(OutputDirectory, { recursive: true });

    const binary = new Uint8Array(await readFile(PdfPath));
    const engine = new PdfEngine();

    const fragments = await engine.readFragments(binary);

    const graphics = fragments
      .filter(isGraphicsFragment)
      .map(toGraphicsDto)
      .sort((left, right) => {
        if (left.pageNumber !== right.pageNumber) {
          return left.pageNumber - right.pageNumber;
        }

        if (left.y !== right.y) {
          return left.y - right.y;
        }

        return left.x - right.x;
      });

    const report: GraphicsFragmentReport = Object.freeze({
      pdfPath: PdfPath,
      totalFragments: fragments.length,
      textFragments: fragments.filter((x) => x.kind === FragmentKinds.Text).length,
      imageFragments: fragments.filter((x) => x.kind === FragmentKinds.Image).length,
      graphicsFragments: graphics.length,
      graphics,
    });

    await writeFile(OutputJsonPath, `${JSON.stringify(report, null, 2)}\n`);

    expect(graphics.length).toBeGreaterThan(0);
  });
});