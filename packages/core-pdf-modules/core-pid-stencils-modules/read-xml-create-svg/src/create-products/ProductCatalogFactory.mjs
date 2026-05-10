import { readFile } from "node:fs/promises";
import path from "node:path";

export class ProductCatalogFactory {
  #fileFinder;
  #parser;
  #clock;

  constructor(fileFinder, parser, clock) {
    this.#fileFinder = fileFinder;
    this.#parser = parser;
    this.#clock = clock;
  }

  async create(inputDirectory) {
    const xmlFiles = await this.#fileFinder.findXmlFiles(inputDirectory);

    if (xmlFiles.length === 0) {
      throw new Error(`No XML files found under: ${inputDirectory}`);
    }

    const categories = [];

    for (const xmlFile of xmlFiles) {
      const xml = await readFile(xmlFile, "utf8");
      const relativeFile = path.relative(inputDirectory, xmlFile).replaceAll("\\", "/");
      categories.push(this.#parser.parse(xml, relativeFile));
    }

    return {
      schemaVersion: 1,
      generatedAtUtc: this.#clock.nowUtcIso(),
      inputDirectory,
      categoryCount: categories.length,
      productCount: categories.reduce((sum, category) => sum + category.products.length, 0),
      categories,
    };
  }
}