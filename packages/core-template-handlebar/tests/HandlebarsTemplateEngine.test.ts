import { describe, expect, it } from "vitest";
import { HandlebarsTemplateEngine } from "../src/HandlebarsTemplateEngine.js";
import type { ITemplateResolver } from "../src/ITemplateResolver.js";

class TemplateResolverSpy implements ITemplateResolver {
  public readonly calls: string[] = [];
  private readonly templates: Readonly<Record<string, string>>;

  public constructor(templates: Readonly<Record<string, string>>) {
    this.templates = templates;
  }

  public resolve(name: string): string {
    this.calls.push(name);

    const template = this.templates[name];
    if (!template) {
      throw new Error(`Template '${name}' was not found.`);
    }

    return template;
  }
}

describe("HandlebarsTemplateEngine", () => {
  it("should call resolver with the requested template name", () => {
    const resolver = new TemplateResolverSpy({
      hello: "Hello {{name}}",
    });

    const sut = new HandlebarsTemplateEngine(resolver);

    sut.compile("hello");

    expect(resolver.calls).toEqual(["hello"]);
  });

  it("should return a compiled template function that renders output", () => {
    const resolver = new TemplateResolverSpy({
      hello: "Hello {{name}}",
    });

    const sut = new HandlebarsTemplateEngine(resolver);

    const compiled = sut.compile("hello");
    const output = compiled({ name: "Dan" });

    expect(output).toBe("Hello Dan");
  });

  it("should propagate resolver errors", () => {
    const resolver = new TemplateResolverSpy({});

    const sut = new HandlebarsTemplateEngine(resolver);

    expect(() => sut.compile("missing")).toThrow("Template 'missing' was not found.");
  });
});