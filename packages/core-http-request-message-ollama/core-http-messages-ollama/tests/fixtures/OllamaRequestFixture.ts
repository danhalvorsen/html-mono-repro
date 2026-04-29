import {
  HeaderName,
  HeadersBuilder,
  HttpResponseMessageBuilder,
  type IHttpRequestMessage,
  type IHttpResponseMessage,
} from "@monorepo/core-http-messages";

import {
  OllamaEndpoint,
  type OllamaChatRequest,
  type OllamaGenerateRequest,
} from "../../src/index.js";

export class OllamaRequestFixture {
  public readonly endpoint = OllamaEndpoint.create({
    baseUrl: "http://localhost:11434/",
  });

  public createGenerateRequest(): OllamaGenerateRequest {
    return {
      model: "qwen3:8b",
      prompt: "Extract Paris from this text.",
      stream: false,
      format: {
        type: "object",
        properties: {
          value: { type: "string" },
        },
        required: ["value"],
      },
    };
  }

  public createChatRequest(): OllamaChatRequest {
    return {
      model: "qwen3:8b",
      stream: false,
      messages: [
        {
          role: "system",
          content: "Return JSON only.",
        },
        {
          role: "user",
          content: "Extract club names.",
        },
      ],
    };
  }

  public createJsonResponse(body: unknown, statusCode = 200): IHttpResponseMessage {
    return new HttpResponseMessageBuilder()
      .withStatusCode(statusCode)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, "application/json")
          .build(),
      )
      .withBody(body)
      .build();
  }

  public createTextResponse(body: string, statusCode = 200): IHttpResponseMessage {
    return new HttpResponseMessageBuilder()
      .withStatusCode(statusCode)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, "text/plain")
          .build(),
      )
      .withBody(body)
      .build();
  }

  public expectJsonPost(message: IHttpRequestMessage, path: string, body: unknown): void {
    if (message.method !== "POST") {
      throw new Error(`Expected POST. Actual: ${message.method}`);
    }

    if (message.path !== path) {
      throw new Error(`Expected path ${path}. Actual: ${message.path}`);
    }

    if (message.headers.get(HeaderName.ContentType) !== "application/json") {
      throw new Error("Expected content-type application/json.");
    }

    if (message.headers.get(HeaderName.Accept) !== "application/json") {
      throw new Error("Expected accept application/json.");
    }

    if (message.body !== body) {
      throw new Error("Expected request body to be preserved by reference.");
    }
  }
}
