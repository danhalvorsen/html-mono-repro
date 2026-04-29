import { TemplateFormatter, type ITemplate } from "../src/index.js";

describe("TemplateFormatter", () => {
  it("renders a provided model through the template", () => {
    const formatter = new TemplateFormatter<{ name: string }>();
    const template: ITemplate<{ name: string }> = {
      render: (model: { name: string }) => `Hello ${model.name}`,
    };

    expect(formatter.format({ name: "Zoe" }, template)).toBe("Hello Zoe");
  });

  it("falls back when the template is not provided", () => {
    const formatter = new TemplateFormatter<{ value: number }>({
      fallback: "[render failed]",
    });

    expect(formatter.format({ value: 3 }, undefined)).toBe("[render failed]");
    expect(new TemplateFormatter().format(undefined, undefined)).toBe(
      "[template missing]"
    );
  });

  it("applies the sanitizer to every result", () => {
    const formatter = new TemplateFormatter({
      sanitize: (value) => value.trim().toUpperCase(),
      missingTemplateFallback: " missing ",
    });

    const template: ITemplate = {
      render: () => "  name  ",
    };

    expect(formatter.format(undefined, template)).toBe("NAME");
    expect(formatter.format(undefined, undefined)).toBe("MISSING");
  });

  it("calls onError when the template throws and uses a fallback result", () => {
    const template: ITemplate = {
      render: () => {
        throw new Error("boom");
      },
    };
    const formatter = new TemplateFormatter({
      onError: ({ error }) =>
        `[caught error${(error as Error).message ? `: ${(error as Error).message}` : ""}]`,
    });

    expect(formatter.format(undefined, template)).toBe("[caught error: boom]");
  });

  it("uses the configured default model when none is supplied", () => {
    const formatter = new TemplateFormatter({ defaultModel: { version: 1 } });
    const template: ITemplate<{ version: number }> = {
      render: (model: { version: number }) => `v${model.version}`,
    };

    expect(formatter.format(undefined, template)).toBe("v1");
  });
});
