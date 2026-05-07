import { describe, expect, it } from "vitest";
import { CreateProductsTestFixture } from "./CreateProductsTestFixture.js";

describe("ShapeXmlParser", () => {
  it("should parse drawio shape names into product metadata", () => {
    const fixture = new CreateProductsTestFixture();
    const parser = fixture.createParser();

    const category = parser.parse(
      `
      <shapes name="mxGraph.pid.valves">
        <shape name="Ball Valve" w="98" h="60"></shape>
        <shape name="Back Pressure Regulator 1" w="98" h="94"></shape>
      </shapes>
      `,
      "valves.xml",
    );

    expect(category).toEqual({
      category: "Valves",
      type: "valves",
      sourceFile: "valves.xml",
      products: [
        {
          type: "valves",
          name: "Ball Valve",
          productId: "valves.ball-valve",
          filenameBase: "valves.ball-valve",
          sourceFile: "valves.xml",
        },
        {
          type: "valves",
          name: "Back Pressure Regulator 1",
          productId: "valves.back-pressure-regulator-1",
          filenameBase: "valves.back-pressure-regulator-1",
          sourceFile: "valves.xml",
        },
      ],
    });
  });

  it("should decode XML entities in shape names", () => {
    const fixture = new CreateProductsTestFixture();
    const parser = fixture.createParser();

    const category = parser.parse(
      `
      <shapes name="mxGraph.pid.misc">
        <shape name="A&amp;B &quot;Test&quot;" w="10" h="10"></shape>
      </shapes>
      `,
      "misc.xml",
    );

    expect(category.products[0].name).toBe('A&B "Test"');
    expect(category.products[0].filenameBase).toBe("misc.a-b-test");
  });

  it("should reject empty XML content", () => {
    const fixture = new CreateProductsTestFixture();
    const parser = fixture.createParser();

    expect(() => parser.parse("   ", "empty.xml")).toThrow(
      "XML content is empty for: empty.xml",
    );
  });
});
