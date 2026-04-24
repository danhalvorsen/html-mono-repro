// packages/core-ai-openapi-ollama/tests/OllamaClient.test.ts

import { describe, expect, it } from "vitest";

import {
  HeaderName,
  HttpResponseMessageBuilder,
  type IHttpRequestMessage,
  type IHttpResponseMessage,
} from "@monorepo/core-http-messages";

import type { IHttpClient } from "@monorepo/core-http-client-fetch";

import {
  OllamaClient,
  OllamaComposition,
  OllamaGenerateRequestFactory,
  OllamaGenerateResponseMapper,
  OllamaTagsRequestFactory,
  type IOllamaResponseMapper,
  type OllamaGenerateRequest,
  type OllamaGenerateResponse,
} from "../src/index.js";

class FakeHttpClient implements IHttpClient {
  private response?: IHttpResponseMessage;
  private request?: IHttpRequestMessage;

  public withResponse(response: IHttpResponseMessage): this {
    this.response = response;
    return this;
  }

  public getLastRequest(): IHttpRequestMessage {
    if (this.request === undefined) {
      throw new Error("No request was sent.");
    }

    return this.request;
  }

  public async send(request: IHttpRequestMessage): Promise<IHttpResponseMessage> {
    this.request = request;

    if (this.response === undefined) {
      throw new Error("No fake response configured.");
    }

    return this.response;
  }
}

class FakeGenerateResponseMapper
  implements IOllamaResponseMapper<OllamaGenerateResponse>
{
  public map(body: unknown): OllamaGenerateResponse {
    return body as OllamaGenerateResponse;
  }
}

class Fixture {
  public readonly baseUrl = "http://localhost:11434";

  public createGenerateRequest(): OllamaGenerateRequest {
    return Object.freeze({
      model: "qwen2.5-coder:7b",
      prompt: "Write deterministic TypeScript.",
      stream: false,
      options: Object.freeze({
        temperature: 0,
      }),
    });
  }

  public createGenerateResponse(): OllamaGenerateResponse {
    return Object.freeze({
      model: "qwen2.5-coder:7b",
      response: "Generated text.",
      done: true,
    });
  }

  public createHttpResponse(body: unknown): IHttpResponseMessage {
    return new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withBody(body)
      .build();
  }

  public createHttpClient(responseBody: unknown): FakeHttpClient {
    return new FakeHttpClient().withResponse(
      this.createHttpResponse(responseBody),
    );
  }
}

describe("OllamaGenerateRequestFactory", () => {
  it("should create JSON POST request for generate endpoint", () => {
    const fixture = new Fixture();

    const request = new OllamaGenerateRequestFactory(fixture.baseUrl).create(
      fixture.createGenerateRequest(),
    );

    expect(request.method).toBe("POST");
    expect(request.path).toBe("http://localhost:11434/api/generate");
    expect(request.headers.get(HeaderName.ContentType)).toBe("application/json");
    expect(request.headers.get(HeaderName.Accept)).toBe("application/json");
    expect(request.body).toEqual(fixture.createGenerateRequest());
  });
});

describe("OllamaTagsRequestFactory", () => {
  it("should create JSON GET request for tags endpoint", () => {
    const fixture = new Fixture();

    const request = new OllamaTagsRequestFactory(fixture.baseUrl).create();

    expect(request.method).toBe("GET");
    expect(request.path).toBe("http://localhost:11434/api/tags");
    expect(request.headers.get(HeaderName.Accept)).toBe("application/json");
    expect(request.headers.get(HeaderName.ContentType)).toBeUndefined();
    expect(request.body).toBeUndefined();
  });
});

describe("OllamaGenerateResponseMapper", () => {
  it("should map valid generate response", () => {
    const fixture = new Fixture();

    const response = new OllamaGenerateResponseMapper().map(
      fixture.createGenerateResponse(),
    );

    expect(response).toEqual(fixture.createGenerateResponse());
  });

  it("should reject invalid generate response", () => {
    expect(() => new OllamaGenerateResponseMapper().map({ model: "x" }))
      .toThrowError("Invalid Ollama generate response.");
  });
});

describe("OllamaClient", () => {
  it("should send generate request and map response", async () => {
    const fixture = new Fixture();
    const expectedResponse = fixture.createGenerateResponse();
    const httpClient = fixture.createHttpClient(expectedResponse);

    const client = new OllamaClient(
      httpClient,
      new OllamaGenerateRequestFactory(fixture.baseUrl),
      new FakeGenerateResponseMapper(),
    );

    const response = await client.generate(fixture.createGenerateRequest());

    expect(response).toEqual(expectedResponse);

    const sentRequest = httpClient.getLastRequest();
    expect(sentRequest.method).toBe("POST");
    expect(sentRequest.path).toBe("http://localhost:11434/api/generate");
  });

  it("should create client from composition root", () => {
    const fixture = new Fixture();
    const httpClient = fixture.createHttpClient(fixture.createGenerateResponse());

    const client = OllamaComposition.createClient(httpClient, {
      baseUrl: fixture.baseUrl,
    });

    expect(client).toBeDefined();
  });
});
