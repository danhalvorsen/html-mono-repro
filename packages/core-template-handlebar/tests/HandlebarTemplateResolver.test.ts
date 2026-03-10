import { describe, expect, it } from "vitest";
import { Directory, File, Path } from "@monorepo/core-filesystem";
import { HandlebarTemplateResolver } from "../src/HandlebarTemplateResolver.js";

describe("HandlebarTemplateResolver", () => {
  it("should resolve an existing template", () => {
    const templatesRoot = new Directory(Path.from("templates"));
    const sut = new HandlebarTemplateResolver(templatesRoot);

    const result = sut.resolve("package");

    expect(result).toContain('"name": "{{scope}}/{{name}}"');
    expect(result).toContain('"version": "{{version}}"');
  });

  it("should throw when template does not exist", () => {
    const templatesRoot = new Directory(Path.from("templates"));
    const sut = new HandlebarTemplateResolver(templatesRoot);

    expect(() => sut.resolve("does-not-exist")).toThrow();
  });
});
