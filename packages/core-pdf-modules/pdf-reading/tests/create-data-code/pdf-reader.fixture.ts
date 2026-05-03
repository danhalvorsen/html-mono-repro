// pdf-reader.fixture.ts

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  CompositePdfEngine,
  PdfImageExtractor,
  type IReaderConfiguration,
} from "@monorepo/core-pdf-reader";

export class PdfReaderFixture {
  public readonly inputPdfPath: string;
  public readonly outputDirectory: string;
  public readonly fragmentsJsonPath: string;
  public readonly imagesRootDirectory: string;
  public readonly imagesJsonPath: string;
  public readonly imagesFilesDirectory: string;

  public readonly engine: CompositePdfEngine;
  public readonly readerConfiguration: IReaderConfiguration;
  public readonly imageExtractor: PdfImageExtractor;

  public constructor(currentWorkingDirectory: string) {
    this.inputPdfPath = join(
      currentWorkingDirectory,
      "..",
      "..",
      "core-pdf-reader",
      "tests",
      "Kiwi.pdf",
    );

    this.outputDirectory = join(currentWorkingDirectory, "tests", "generated");
    this.fragmentsJsonPath = join(this.outputDirectory, "Kiwi.fragments.json");
    this.imagesRootDirectory = join(this.outputDirectory, "kiwi-images");
    this.imagesJsonPath = join(this.imagesRootDirectory, "Kiwi.images.json");
    this.imagesFilesDirectory = join(this.imagesRootDirectory, "files");

    this.engine = new CompositePdfEngine();
    this.readerConfiguration = Object.freeze({
      saveReadImages: true,
    });
    this.imageExtractor = new PdfImageExtractor(this.readerConfiguration);
  }

  public async readBinary(): Promise<Uint8Array> {
    return new Uint8Array(await readFile(this.inputPdfPath));
  }
}