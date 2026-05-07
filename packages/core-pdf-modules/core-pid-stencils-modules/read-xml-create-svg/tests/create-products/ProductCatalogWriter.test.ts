import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProductCatalogWriter } from "../../src/create-products/ProductCatalogWriter.mjs";
import { CreateProductsTestFixture } from "./CreateProductsTestFixture.js";

describe("ProductCatalogWriter", () => {
  let fixture: CreateProductsTestFixture;

  beforeEach(async () => {
    fixture = await new CreateProductsTestFixture().initialize();
  });

  afterEach(async () => {
    await fixture.dispose();
  });

  it("should write formatted JSON and create missing output directories", async () => {
    const outputFile = path.join(fixture.root, "generated", "products.json");

    await new ProductCatalogWriter().write(outputFile, {
      schemaVersion: 1,
      categories: [],
    });

    const content = await readFile(outputFile, "utf8");

    expect(content).toBe(`{
  "schemaVersion": 1,
  "categories": []
}
`);
  });
});
