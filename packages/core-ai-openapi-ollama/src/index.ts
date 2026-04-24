// packages/core-ai-openapi-ollama/src/index.ts

import type { IHttpClient } from "@monorepo/core-http-messages-http-client";
import type { IHttpRequestMessage } from "@monorepo/core-http-messages";
import type { IHttpRequestMessageFactory } from "@monorepo/core-http-message-factories";
import {
  JsonGetRequestMessageFactory,
  JsonPostRequestMessageFactory,
} from "@monorepo/core-http-message-factories";

export interface IOllamaClient {
  generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse>;
}

export interface IOllamaResponseMapper<TResponse> {
  map(body: unknown): TResponse;
}

export interface OllamaClientOptions {
  readonly baseUrl: string;
}

export interface OllamaGenerateRequest {
  readonly model: string;
  readonly prompt: string;
  readonly stream?: false;
  readonly options?: Readonly<Record<string, unknown>>;
}

export interface OllamaGenerateResponse {
  readonly model: string;
  readonly response: string;
  readonly done: boolean;
}

export class OllamaGenerateRequestFactory
  extends JsonPostRequestMessageFactory<OllamaGenerateRequest>
{
  public constructor(baseUrl: string) {
    super(`${baseUrl}/api/generate`);
  }
}

export class OllamaTagsRequestFactory extends JsonGetRequestMessageFactory {
  public constructor(baseUrl: string) {
    super(`${baseUrl}/api/tags`);
  }
}

export class OllamaClient implements IOllamaClient {
  public constructor(
    private readonly httpClient: IHttpClient,
    private readonly generateRequestFactory: IHttpRequestMessageFactory<OllamaGenerateRequest>,
    private readonly generateResponseMapper: IOllamaResponseMapper<OllamaGenerateResponse>,
  ) {}

  public async generate(
    request: OllamaGenerateRequest,
  ): Promise<OllamaGenerateResponse> {
    const httpRequest: IHttpRequestMessage =
      this.generateRequestFactory.create(request);

    const httpResponse = await this.httpClient.send(httpRequest);

    return this.generateResponseMapper.map(httpResponse.body);
  }
}

export class OllamaGenerateResponseMapper
  implements IOllamaResponseMapper<OllamaGenerateResponse>
{
  public map(body: unknown): OllamaGenerateResponse {
    if (!this.isGenerateResponse(body)) {
      throw new Error("Invalid Ollama generate response.");
    }

    return body;
  }

  private isGenerateResponse(body: unknown): body is OllamaGenerateResponse {
    if (typeof body !== "object" || body === null) {
      return false;
    }

    const candidate = body as Partial<OllamaGenerateResponse>;

    return (
      typeof candidate.model === "string" &&
      typeof candidate.response === "string" &&
      typeof candidate.done === "boolean"
    );
  }
}

export class OllamaComposition {
  public static createClient(
    httpClient: IHttpClient,
    options: OllamaClientOptions,
  ): IOllamaClient {
    return new OllamaClient(
      httpClient,
      new OllamaGenerateRequestFactory(options.baseUrl),
      new OllamaGenerateResponseMapper(),
    );
  }
}