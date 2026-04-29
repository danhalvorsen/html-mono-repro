import {
  JsonGetRequestMessageFactory,
  JsonPostRequestMessageFactory,
} from "@monorepo/core-http-message-factories";

import {
  HeaderName,
  type IHttpResponseMessage,
} from "@monorepo/core-http-messages";

export interface OllamaEndpointOptions {
  readonly baseUrl: string;
}

export class OllamaEndpoint {
  private constructor(public readonly baseUrl: string) {}

  public static create(options: OllamaEndpointOptions): OllamaEndpoint {
    const normalized = options.baseUrl.trim().replace(/\/+$/u, "");

    if (normalized.length === 0) {
      throw new Error("Ollama base URL is required.");
    }

    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      throw new Error(`Ollama base URL must be absolute: ${options.baseUrl}`);
    }

    return new OllamaEndpoint(normalized);
  }

  public static localhost(): OllamaEndpoint {
    return OllamaEndpoint.create({
      baseUrl: "http://127.0.0.1:11434",
    });
  }

  public resolve(path: OllamaApiPath): string {
    return `${this.baseUrl}${path}`;
  }
}

export enum OllamaApiPath {
  Generate = "/api/generate",
  Chat = "/api/chat",
  Tags = "/api/tags",
}

export interface OllamaGenerateRequest {
  readonly model: string;
  readonly prompt: string;
  readonly stream?: boolean;
  readonly format?: unknown;
  readonly options?: Readonly<Record<string, unknown>>;
}

export interface OllamaChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface OllamaChatRequest {
  readonly model: string;
  readonly messages: readonly OllamaChatMessage[];
  readonly stream?: boolean;
  readonly format?: unknown;
  readonly options?: Readonly<Record<string, unknown>>;
}

export class OllamaGenerateRequestMessageFactory extends JsonPostRequestMessageFactory<OllamaGenerateRequest> {
  public constructor(endpoint: OllamaEndpoint) {
    super(endpoint.resolve(OllamaApiPath.Generate));
  }
}

export class OllamaChatRequestMessageFactory extends JsonPostRequestMessageFactory<OllamaChatRequest> {
  public constructor(endpoint: OllamaEndpoint) {
    super(endpoint.resolve(OllamaApiPath.Chat));
  }
}

export class OllamaTagsRequestMessageFactory extends JsonGetRequestMessageFactory {
  public constructor(endpoint: OllamaEndpoint) {
    super(endpoint.resolve(OllamaApiPath.Tags));
  }
}

export class OllamaResponseContentReader {
  public readGenerateText(response: IHttpResponseMessage): string {
    this.assertSuccessfulJson(response);

    const body = this.requireRecord(response.body);
    const responseText = body.response;

    if (typeof responseText !== "string") {
      throw new Error("Ollama generate response body is missing string property 'response'.");
    }

    return responseText;
  }

  public readChatText(response: IHttpResponseMessage): string {
    this.assertSuccessfulJson(response);

    const body = this.requireRecord(response.body);
    const message = this.requireRecord(body.message);
    const content = message.content;

    if (typeof content !== "string") {
      throw new Error("Ollama chat response body is missing string property 'message.content'.");
    }

    return content;
  }

  private assertSuccessfulJson(response: IHttpResponseMessage): void {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`Ollama response failed with status code ${response.statusCode}.`);
    }

    if (!response.isJson()) {
      const contentType = response.headers.get(HeaderName.ContentType);

      throw new Error(
        `Ollama response must be JSON. Actual content type: ${contentType ?? "unknown"}.`,
      );
    }
  }

  private requireRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("Ollama response body must be a JSON object.");
    }

    return value as Record<string, unknown>;
  }
}
