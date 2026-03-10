import { describe, expect, it } from "vitest";
import * as api from "../src/index.js";

describe("package public api", () => {
  it("should export TemplateRenderer", () => {
    expect(api.TemplateRenderer).toBeDefined();
  });

  it("should export Scaffolder", () => {
    expect(api.Scaffolder).toBeDefined();
  });

  it("should export HandlebarsTemplateEngine", () => {
    expect(api.HandlebarsTemplateEngine).toBeDefined();
  });

  it("should export HandlebarTemplateResolver", () => {
    expect(api.HandlebarTemplateResolver).toBeDefined();
  });

  it("should export FilesystemWriter", () => {
    expect(api.FilesystemWriter).toBeDefined();
  });

  it("should export ScaffoldingBlueprint", () => {
    expect(api.ScaffoldingBlueprint).toBeDefined();
  });

  it("should export TemplateFileDescriptor", () => {
    expect(api.TemplateFileDescriptor).toBeDefined();
  });
});