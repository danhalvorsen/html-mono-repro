import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "vitest";
import { ProductCatalogFactory } from "../../src/create-products/ProductCatalogFactory.mjs";
import { ShapeXmlParser } from "../../src/create-products/ShapeXmlParser.mjs";
import { XmlEntityDecoder } from "../../src/create-products/XmlEntityDecoder.mjs";
import { XmlFileFinder } from "../../src/create-products/XmlFileFinder.mjs";

export class CreateProductsTestFixture {
  #root: string | undefined;

  public constructor() {
    this.#root = undefined;
  }

  public get root(): string {
    if (!this.#root) {
      throw new Error("Fixture is not initialized.");
    }

    return this.#root;
  }

  public async initialize(): Promise<this> {
    this.#root = await mkdtemp(path.join(tmpdir(), "create-products-"));
    return this;
  }

  public async dispose(): Promise<void> {
    if (this.#root) {
      await rm(this.#root, { recursive: true, force: true });
      this.#root = undefined;
    }
  }

  public async writeXml(relativePath: string, content: string): Promise<string> {
    const fullPath = path.join(this.root, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf8");
    return fullPath;
  }

  public createParser(): ShapeXmlParser {
    return new ShapeXmlParser(new XmlEntityDecoder());
  }

  public createCatalogFactory(clock: FixedClock = new FixedClock()): ProductCatalogFactory {
    return new ProductCatalogFactory(
      new XmlFileFinder(),
      this.createParser(),
      clock,
    );
  }

  public expectProduct(product: unknown, expected: unknown): void {
    expect(product).toEqual(expected);
  }
}

export class FixedClock {
  public nowUtcIso(): string {
    return "2026-05-07T00:00:00.000Z";
  }
}
