import { describe, it, expect } from "vitest";
import { TemplateFixture } from "./fixtures/TemplateFixture.js";

describe("Handlebar Templates (Fixture DRY)", () => {
  const fx = new TemplateFixture();
  const templateFiles = fx.listTemplateFiles();

  it("template root should exist", () => {
    expect(fx.root.exists()).toBe(true);
  });

  it("should contain at least one template", () => {
    expect(templateFiles.length).toBeGreaterThan(0);
  });

  describe.each(templateFiles.map((file) => [file, file.path.basename]))(
    "Template: %s",
    (file, fileName) => {

      it("should load raw template", () => {
        const raw = fx.loadRaw(file);
        expect(raw.length).toBeGreaterThan(0);
      });

      it("should compile without error", () => {
        const raw = fx.loadRaw(file);
        expect(() => fx.compile(raw)).not.toThrow();
      });

      it("should render final string with fixture context", () => {
        const raw = fx.loadRaw(file);
        const output = fx.render(raw);

        expect(typeof output).toBe("string");
        expect(output.length).toBeGreaterThan(0);
      });

      it("should not contain unresolved handlebars {{placeholders}}", () => {
        const raw = fx.loadRaw(file);
        const output = fx.render(raw);

        expect(fx.hasUnresolvedPlaceholders(output)).toBe(false);
      });
    }
  );
});
