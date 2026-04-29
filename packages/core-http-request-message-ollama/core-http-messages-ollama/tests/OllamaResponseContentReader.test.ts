import { describe, expect, it } from "vitest";

import { OllamaResponseContentReader } from "../src/index.js";

import { OllamaRequestFixture } from "./fixtures/OllamaRequestFixture.js";

describe("OllamaResponseContentReader", () => {
  it("should read generate text from a successful JSON response", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createJsonResponse({
      model: "qwen3:8b",
      done: true,
      response: "{\"clubs\":[\"Paris\"]}",
    });

    const text = new OllamaResponseContentReader().readGenerateText(response);

    expect(text).toBe("{\"clubs\":[\"Paris\"]}");
  });

  it("should read chat text from a successful JSON response", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createJsonResponse({
      model: "qwen3:8b",
      done: true,
      message: {
        role: "assistant",
        content: "{\"clubs\":[\"Paris\"]}",
      },
    });

    const text = new OllamaResponseContentReader().readChatText(response);

    expect(text).toBe("{\"clubs\":[\"Paris\"]}");
  });

  it("should reject non-success status codes", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createJsonResponse(
      {
        error: "model not found",
      },
      404,
    );

    expect(() =>
      new OllamaResponseContentReader().readGenerateText(response),
    ).toThrow("Ollama response failed with status code 404.");
  });

  it("should reject non-JSON responses", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createTextResponse("not json");

    expect(() =>
      new OllamaResponseContentReader().readGenerateText(response),
    ).toThrow("Ollama response must be JSON.");
  });

  it("should reject non-object JSON bodies", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createJsonResponse(["invalid"]);

    expect(() =>
      new OllamaResponseContentReader().readGenerateText(response),
    ).toThrow("Ollama response body must be a JSON object.");
  });

  it("should reject generate responses without response text", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createJsonResponse({
      done: true,
    });

    expect(() =>
      new OllamaResponseContentReader().readGenerateText(response),
    ).toThrow("Ollama generate response body is missing string property 'response'.");
  });

  it("should reject chat responses without message content", () => {
    const fixture = new OllamaRequestFixture();

    const response = fixture.createJsonResponse({
      done: true,
      message: {
        role: "assistant",
      },
    });

    expect(() =>
      new OllamaResponseContentReader().readChatText(response),
    ).toThrow("Ollama chat response body is missing string property 'message.content'.");
  });
});
