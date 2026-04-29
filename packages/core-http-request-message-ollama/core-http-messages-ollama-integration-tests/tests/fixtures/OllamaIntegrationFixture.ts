import type { IHttpResponseMessage } from "@monorepo/core-http-messages";

import {
  HttpClientBuilder,
  type IHttpClient
} from "@monorepo/core-http-messages-http-client";

import {
  OllamaEndpoint,
  OllamaGenerateRequestMessageFactory,
  OllamaResponseContentReader,
  OllamaTagsRequestMessageFactory,
  type OllamaGenerateRequest
} from "@monorepo/core-http-messages-ollama";

import {
  OllamaIntegrationTestConfigurationFactory,
  type OllamaIntegrationTestConfiguration
} from "./OllamaIntegrationTestConfiguration.js";

import {
  OllamaResponseAssertions,
  type OllamaModelInfo
} from "./OllamaResponseAssertions.js";

export class OllamaIntegrationFixture {
  public readonly configuration: OllamaIntegrationTestConfiguration;
  public readonly endpoint: OllamaEndpoint;
  public readonly assertions: OllamaResponseAssertions;

  public constructor() {
    this.configuration = new OllamaIntegrationTestConfigurationFactory().create();
    this.endpoint = OllamaEndpoint.create({
      baseUrl: this.configuration.baseUrl
    });
    this.assertions = new OllamaResponseAssertions();
  }

  public createHttpClient(): IHttpClient {
    // IMPORTANT:
    // Do not add ThrowOnErrorResponseInterceptor here.
    // Integration tests must inspect Ollama's error response body when status is 500.
    return new HttpClientBuilder().build();
  }

  public async sendTagsRequest(client: IHttpClient): Promise<IHttpResponseMessage> {
    const request = new OllamaTagsRequestMessageFactory(this.endpoint).create();
    return client.send(request);
  }

  public async sendGenerateRequest(client: IHttpClient): Promise<IHttpResponseMessage> {
    const body: OllamaGenerateRequest = {
      model: this.configuration.modelName,
      stream: false,
      prompt: [
        "Extract structured data from the raw input.",
        "Return exactly one JSON object.",
        "Do not include markdown.",
        "Do not include explanation.",
        "",
        "Raw input:",
        "<a title=\"Paris\" href=\"/api/v1/linkrules/team/52747/statistics?competitionId=1&phase=TOURNAMENT\"><span>Paris</span><span>France</span></a>",
        "",
        "Expected JSON shape:",
        "{\"teamName\":\"Paris\",\"country\":\"France\",\"teamId\":\"52747\",\"phase\":\"TOURNAMENT\"}"
      ].join("\n"),

      // KISS: use JSON mode first. Some local Ollama/model combinations fail with full JSON Schema.
      format: "json",

      options: {
        temperature: 0,
        num_predict: 96,
        num_ctx: 2048
      }
    };

    const request = new OllamaGenerateRequestMessageFactory(this.endpoint).create(body);
    return client.send(request);
  }

  public async readInstalledModels(client: IHttpClient): Promise<readonly OllamaModelInfo[]> {
    const response = await this.sendTagsRequest(client);
    return this.assertions.readModels(response);
  }

  public readGenerateText(response: IHttpResponseMessage): string {
    this.assertions.assertOkJson(response);
    return new OllamaResponseContentReader().readGenerateText(response);
  }
}
