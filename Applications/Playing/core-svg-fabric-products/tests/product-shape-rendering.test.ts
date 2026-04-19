import { litSvgNodeRenderer } from "@monorepo/core-svg-fabric";
import type { TemplateResult } from "lit";
import { describe, expect, it } from "vitest";
import { createBoxTriangleShapeRootNode } from "../src/composition/product-shape-node-factory.js";
import { boxTriangleShapeFixture } from "./fixtures/productShapeFixtures.js";

function isTemplateResult(value: unknown): value is TemplateResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "strings" in value &&
    "values" in value
  );
}

function collectTemplateText(template: TemplateResult): string {
  let output = template.strings.join("");

  for (const value of template.values) {
    if (isTemplateResult(value)) {
      output += collectTemplateText(value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (isTemplateResult(item)) {
          output += collectTemplateText(item);
        }
      }
    }
  }

  return output;
}

function collectScalarValues(template: TemplateResult): Array<string | number | boolean> {
  const scalars: Array<string | number | boolean> = [];

  const visit = (value: unknown): void => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      scalars.push(value);
      return;
    }

    if (isTemplateResult(value)) {
      for (const nested of value.values) {
        visit(nested);
      }
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
    }
  };

  for (const value of template.values) {
    visit(value);
  }

  return scalars;
}

describe("product shape rendering", () => {
  it("renders box-triangle SVG template with expected style values", () => {
    const node = createBoxTriangleShapeRootNode(boxTriangleShapeFixture);
    const template = litSvgNodeRenderer.render(node);
    const templateText = collectTemplateText(template);
    const values = collectScalarValues(template);

    expect(templateText).toContain("<svg");
    expect(templateText).toContain("<rect");
    expect(templateText).toContain("<polygon");
    expect(values).toContain("#1d9bf0");
    expect(values).toContain("#0b5a8f");
    expect(values).toContain(2);
    expect(values).not.toContain("#000");
    expect(values).not.toContain("#000000");
    expect(values).not.toContain("black");
  });
});
