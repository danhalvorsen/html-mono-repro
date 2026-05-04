 
// src/PdfFragmentFileReader.ts

import { readFile } from "node:fs/promises";

import { PdfEngine } from "@monorepo/core-pdf-reader";
import type { PdfFragment } from "@monorepo/core-pdf-domain"

export class PdfFragmentFileReader {
  public async readFragments(pdfPath: string): Promise<readonly PdfFragment[]> {
    const binary = await readFile(pdfPath);

    return (await new PdfEngine().readFragments(binary)) as readonly PdfFragment[];
  }
}