import { describe, expect, it } from "vitest";

import { HeaderName } from "@monorepo/core-http-messages";

import {
  OllamaApiPath,
  OllamaChatRequestMessageFactory,
  OllamaGenerateRequestMessageFactory,
  OllamaRequestMessageFactoryComposition,
  OllamaTagsRequestMessageFactory,
  assertJsonRequestMessage,
  createOllamaJsonSchemaFormat,
} from "../src/index.js";

import { OllamaRequestFixture } from "./fixtures/OllamaRequestFixture.js";

describe("Ollama request message factories", () => {
  it("should create a JSON POST request for /api/generate", () => {
    const fixture = new OllamaRequestFixture();
    const requestBody = fixture.createGenerateRequest();

    const message = new OllamaGenerateRequestMessageFactory(fixture.endpoint)
      .create(requestBody);

    fixture.expectJsonPost(
      message,
      "http://localhost:11434/api/generate",
      requestBody,
    );

    expect(message.body).toBe(requestBody);
    expect(message.headers.get(HeaderName.ContentType)).toBe("application/json");
    expect(message.headers.get(HeaderName.Accept)).toBe("application/json");
  });

  it("should create a JSON POST request for /api/chat", () => {
    const fixture = new OllamaRequestFixture();
    const requestBody = fixture.createChatRequest();

    const message = new OllamaChatRequestMessageFactory(fixture.endpoint)
      .create(requestBody);

    fixture.expectJsonPost(
      message,
      "http://localhost:11434/api/chat",
      requestBody,
    );
  });

  it("should create a JSON GET request for /api/tags", () => {
    const fixture = new OllamaRequestFixture();

    const message = new OllamaTagsRequestMessageFactory(fixture.endpoint)
      .create();

    expect(message.method).toBe("GET");
    expect(message.path).toBe("http://localhost:11434/api/tags");
    expect(message.body).toBeUndefined();
    expect(message.headers.get(HeaderName.Accept)).toBe("application/json");
    expect(message.headers.get(HeaderName.ContentType)).toBeUndefined();
  });

  it("should create factories from the composition root", () => {
    const composition = OllamaRequestMessageFactoryComposition.localhost();

    const generate = composition.createGenerateFactory()
      .create({
        model: "qwen3:8b",
        prompt: "Hello",
        stream: false,
      });

    const chat = composition.createChatFactory()
      .create({
        model: "qwen3:8b",
        stream: false,
        messages: [{ role: "user", content: "Hello" }],
      });

    const tags = composition.createTagsFactory().create();

    expect(generate.path).toBe("http://127.0.0.1:11434/api/generate");
    expect(chat.path).toBe("http://127.0.0.1:11434/api/chat");
    expect(tags.path).toBe("http://127.0.0.1:11434/api/tags");
  });

  it("should expose the Ollama API path enum", () => {
    expect(OllamaApiPath.Generate).toBe("/api/generate");
    expect(OllamaApiPath.Chat).toBe("/api/chat");
    expect(OllamaApiPath.Tags).toBe("/api/tags");
  });

  it("should freeze JSON schema format values", () => {
    const schema = createOllamaJsonSchemaFormat({
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    });

    expect(Object.isFrozen(schema)).toBe(true);
    expect(schema.type).toBe("object");
  });

  it("should assert JSON request messages", () => {
    const fixture = new OllamaRequestFixture();

    const message = new OllamaGenerateRequestMessageFactory(fixture.endpoint)
      .create(fixture.createGenerateRequest());

    expect(() => assertJsonRequestMessage(message)).not.toThrow();
  });
});
