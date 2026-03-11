import { describe, expect, it } from "vitest";
import { TemplateRenderer } from "../src/TemplateRenderer.js";
import type { ITemplateEngine } from "../src/ITemplateEngine.js";

class TemplateEngineSpy implements ITemplateEngine {
  public readonly compileCalls: string[] = [];
  public readonly renderCalls: object[] = [];
  private readonly result: string;

  public constructor(result: string) {
    this.result = result;
  }

  public compile(templateName: string): (ctx: object) => string {
    this.compileCalls.push(templateName);

    return (ctx: object) => {
      this.renderCalls.push(ctx);
      return this.result;
    };
  }
}

class ThrowingTemplateEngine implements ITemplateEngine {
  public compile(): (ctx: object) => string {
    throw new Error("compile failed");
  }
}

describe("TemplateRenderer", () => {
  it("should call engine.compile with the correct template name", () => {
    const engine = new TemplateEngineSpy("rendered-output");
    const sut = new TemplateRenderer(engine);

    sut.render("package", { name: "demo" });

    expect(engine.compileCalls).toEqual(["package"]);
  });

  it("should invoke compiled template with the exact context", () => {
    const engine = new TemplateEngineSpy("rendered-output");
    const sut = new TemplateRenderer(engine);

    const context = { name: "demo", version: "1.0.0" };
    sut.render("package", context);

    expect(engine.renderCalls).toEqual([context]);
  });

  it("should return rendered output", () => {
    const engine = new TemplateEngineSpy("rendered-output");
    const sut = new TemplateRenderer(engine);

    const result = sut.render("package", { name: "demo" });

    expect(result).toBe("rendered-output");
  });

  it("should propagate compile errors", () => {
    const engine = new ThrowingTemplateEngine();
    const sut = new TemplateRenderer(engine);

    expect(() => sut.render("package", { name: "demo" })).toThrow("compile failed");
  });
});
