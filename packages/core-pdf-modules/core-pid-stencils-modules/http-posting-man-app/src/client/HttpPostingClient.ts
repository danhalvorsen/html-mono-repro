import type { IHttpClient } from "@monorepo/core-http-messages-http-client";
import {
  ApiDispatchEnvelopeReader,
  type ApiDispatchEnvelope,
} from "../contracts/ApiDispatchEnvelope.js";
import {
  EndpointPath,
  type EndpointPath as EndpointPathType,
} from "../contracts/EndpointPath.js";
import type { HttpPostingClientOptions } from "../contracts/HttpPostingClientOptions.js";
import type { IHttpPostingClient } from "./IHttpPostingClient.js";
import type { IHttpRequestMessageFactory } from "./IHttpRequestMessageFactory.js";

export class HttpPostingClient implements IHttpPostingClient {
  private readonly httpClient: IHttpClient;
  private readonly options: HttpPostingClientOptions;
  private readonly requestMessageFactory: IHttpRequestMessageFactory;
  private readonly envelopeReader: ApiDispatchEnvelopeReader;

  public constructor(
    httpClient: IHttpClient,
    options: HttpPostingClientOptions,
    requestMessageFactory: IHttpRequestMessageFactory,
    envelopeReader: ApiDispatchEnvelopeReader,
  ) {
    this.httpClient = httpClient;
    this.options = options;
    this.requestMessageFactory = requestMessageFactory;
    this.envelopeReader = envelopeReader;
  }

  public postCommand<TResponse>(message: unknown): Promise<TResponse> {
    return this.post<TResponse>(EndpointPath.Command, message);
  }

  public postQuery<TResponse>(message: unknown): Promise<TResponse> {
    return this.post<TResponse>(EndpointPath.Query, message);
  }

  private async post<TResponse>(
    endpointPath: EndpointPathType,
    message: unknown,
  ): Promise<TResponse> {
    const request = this.requestMessageFactory.createJsonPost(
      this.toAbsoluteUrl(endpointPath),
      message,
      this.options.bearerToken,
    );

    const response = await this.httpClient.send(request);
    const envelope = this.envelopeReader.read<TResponse>(response.body);

    this.assertSuccessfulResponse(response.statusCode, envelope);

    if (envelope.data === undefined) {
      throw new Error("API response did not contain data.");
    }

    return envelope.data;
  }

  private toAbsoluteUrl(endpointPath: string): string {
    return `${this.options.baseUrl.replace(/\/+$/u, "")}${endpointPath}`;
  }

  private assertSuccessfulResponse<TResponse>(
    statusCode: number,
    envelope: ApiDispatchEnvelope<TResponse>,
  ): void {
    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(
        envelope.error ?? `HTTP request failed with status ${statusCode}.`,
      );
    }

    if (!envelope.ok) {
      throw new Error(envelope.error ?? "HTTP post failed.");
    }
  }
}