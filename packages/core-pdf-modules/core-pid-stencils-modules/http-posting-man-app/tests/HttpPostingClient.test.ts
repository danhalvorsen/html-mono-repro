import {
  HeaderName,
  HeadersBuilder,
  HttpResponseMessageBuilder,
  type IHttpRequestMessage,
  type IHttpResponseMessage,
} from "@monorepo/core-http-messages";
import type { IHttpClient } from "@monorepo/core-http-messages-http-client";
import { should } from "chai";
import { describe, it } from "vitest";
import { HttpPostingClient } from "../src/client/HttpPostingClient.js";
import { HttpRequestMessageFactory } from "../src/client/HttpRequestMessageFactory.js";
import { ApiDispatchEnvelopeReader } from "../src/contracts/ApiDispatchEnvelope.js";

should();

class FakeHttpClient implements IHttpClient {
  public readonly sentRequests: IHttpRequestMessage[] = [];
  private readonly response: IHttpResponseMessage;

  public constructor(response: IHttpResponseMessage) {
    this.response = response;
  }

  public async send(request: IHttpRequestMessage): Promise<IHttpResponseMessage> {
    this.sentRequests.push(request);
    return this.response;
  }
}

function createJsonResponse(body: unknown): IHttpResponseMessage {
  return new HttpResponseMessageBuilder()
    .withStatusCode(200)
    .withHeaders(
      new HeadersBuilder()
        .with(HeaderName.ContentType, "application/json")
        .build(),
    )
    .withBody(body)
    .build();
}

describe("HttpPostingClient", () => {
  it("should post command messages to /api/command", async () => {
    const fakeHttpClient = new FakeHttpClient(
      createJsonResponse({
        ok: true,
        data: { accepted: true },
      }),
    );

    const client = new HttpPostingClient(
      fakeHttpClient,
      {
        baseUrl: "http://localhost:3000/",
        bearerToken: undefined,
      },
      new HttpRequestMessageFactory(),
      new ApiDispatchEnvelopeReader(),
    );

    const result = await client.postCommand<{ readonly accepted: boolean }>({
      type: "AnyCommand",
    });

    result.accepted.should.equal(true);
    fakeHttpClient.sentRequests.length.should.equal(1);
    fakeHttpClient.sentRequests[0]!.path.should.equal("http://localhost:3000/api/command");
    fakeHttpClient.sentRequests[0]!.method.should.equal("POST");
    fakeHttpClient.sentRequests[0]!.body.should.deep.equal({ type: "AnyCommand" });
  });

  it("should post query messages to /api/query", async () => {
    const fakeHttpClient = new FakeHttpClient(
      createJsonResponse({
        ok: true,
        data: [{ id: "one" }],
      }),
    );

    const client = new HttpPostingClient(
      fakeHttpClient,
      {
        baseUrl: "http://localhost:3000",
        bearerToken: undefined,
      },
      new HttpRequestMessageFactory(),
      new ApiDispatchEnvelopeReader(),
    );

    const result = await client.postQuery<readonly { readonly id: string }[]>({
      type: "AnyQuery",
    });

    result[0]!.id.should.equal("one");
    fakeHttpClient.sentRequests[0]!.path.should.equal("http://localhost:3000/api/query");
  });

  it("should throw when API envelope is not ok", async () => {
    const fakeHttpClient = new FakeHttpClient(
      createJsonResponse({
        ok: false,
        error: "Rejected",
      }),
    );

    const client = new HttpPostingClient(
      fakeHttpClient,
      {
        baseUrl: "http://localhost:3000",
        bearerToken: undefined,
      },
      new HttpRequestMessageFactory(),
      new ApiDispatchEnvelopeReader(),
    );

    let actualError: unknown;

    try {
      await client.postCommand<unknown>({ type: "AnyCommand" });
    }
    catch (error) {
      actualError = error;
    }

    actualError.should.be.instanceOf(Error);
    (actualError as Error).message.should.equal("Rejected");
  });
});