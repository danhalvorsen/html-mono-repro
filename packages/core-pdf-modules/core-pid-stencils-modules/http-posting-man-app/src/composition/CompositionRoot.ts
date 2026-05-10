import { HttpClientBuilder } from "@monorepo/core-http-messages-http-client";
import { HttpPostingClient } from "../client/HttpPostingClient.js";
import { HttpRequestMessageFactory } from "../client/HttpRequestMessageFactory.js";
import type { IHttpPostingClient } from "../client/IHttpPostingClient.js";
import { ApiDispatchEnvelopeReader } from "../contracts/ApiDispatchEnvelope.js";
import type { HttpPostingClientOptions } from "../contracts/HttpPostingClientOptions.js";

export class CompositionRoot {
  public createHttpPostingClient(
    options: HttpPostingClientOptions,
  ): IHttpPostingClient {
    return new HttpPostingClient(
      new HttpClientBuilder().build(),
      options,
      new HttpRequestMessageFactory(),
      new ApiDispatchEnvelopeReader(),
    );
  }
}