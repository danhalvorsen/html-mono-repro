import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CreateProductsTestFixture, FixedClock } from "./CreateProductsTestFixture.js";

describe("ProductCatalogFactory", () => {
  let fixture: CreateProductsTestFixture;

  beforeEach(async () => {
    fixture = await new CreateProductsTestFixture().initialize();
  });

  afterEach(async () => {
    await fixture.dispose();
  });

  it("should create a catalog from all XML files recursively", async () => {
    await fixture.writeXml(
      "valves.xml",
      `
      <shapes name="mxGraph.pid.valves">
        <shape name="Ball Valve"></shape>
        <shape name="Gate Valve"></shape>
      </shapes>
      `,
    );

    await fixture.writeXml(
      "nested/pumps.xml",
      `
      <shapes name="mxGraph.pid.pumps">
        <shape name="Centrifugal Pump"></shape>
      </shapes>
      `,
    );

    await fixture.writeXml("ignore.txt", "not xml");

    const factory = fixture.createCatalogFactory(new FixedClock());
    const catalog = await factory.create(fixture.root);

    expect(catalog.schemaVersion).toBe(1);
    expect(catalog.generatedAtUtc).toBe("2026-05-07T00:00:00.000Z");
    expect(catalog.inputDirectory).toBe(fixture.root);
    expect(catalog.categoryCount).toBe(2);
    expect(catalog.productCount).toBe(3);

    expect(catalog.categories.map((category) => category.sourceFile)).toEqual([
      "nested/pumps.xml",
      "valves.xml",
    ]);

    expect(catalog.categories[0].products[0]).toEqual({
      type: "pumps",
      name: "Centrifugal Pump",
      productId: "pumps.centrifugal-pump",
      filenameBase: "pumps.centrifugal-pump",
      sourceFile: "nested/pumps.xml",
    });
  });

  it("should reject directories without XML files", async () => {
    const factory = fixture.createCatalogFactory();

    await expect(factory.create(fixture.root)).rejects.toThrow(
      `No XML files found under: ${fixture.root}`,
    );
  });
});
