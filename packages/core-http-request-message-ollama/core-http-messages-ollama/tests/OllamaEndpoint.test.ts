import { describe, expect, it } from "vitest";

import { OllamaApiPath, OllamaEndpoint } from "../src/index.js";

describe("OllamaEndpoint", () => {
  it("should normalize trailing slashes", () => {
    const endpoint = OllamaEndpoint.create({
      baseUrl: "http://localhost:11434///",
    });

    expect(endpoint.baseUrl).toBe("http://localhost:11434");
    expect(endpoint.resolve(OllamaApiPath.Generate)).toBe(
      "http://localhost:11434/api/generate",
    );
  });

  it("should create the default localhost endpoint", () => {
    const endpoint = OllamaEndpoint.localhost();

    expect(endpoint.baseUrl).toBe("http://127.0.0.1:11434");
    expect(endpoint.resolve(OllamaApiPath.Tags)).toBe(
      "http://127.0.0.1:11434/api/tags",
    );
  });

  it("should reject an empty base URL", () => {
    expect(() =>
      OllamaEndpoint.create({
        baseUrl: "   ",
      }),
    ).toThrow("Ollama base URL is required.");
  });

  it("should reject a relative base URL", () => {
    expect(() =>
      OllamaEndpoint.create({
        baseUrl: "localhost:11434",
      }),
    ).toThrow("Ollama base URL must be absolute");
  });
});
