import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
  type Headers,
  type IHttpRequestMessage,
} from "@monorepo/core-http-messages";
import type { IHttpRequestMessageFactory } from "./IHttpRequestMessageFactory.js";

export class HttpRequestMessageFactory implements IHttpRequestMessageFactory {
  public createJsonPost(
    absoluteUrl: string,
    body: unknown,
    bearerToken: string | undefined,
  ): IHttpRequestMessage {
    return new HttpRequestMessageBuilder()
      .withMethod("POST")
      .withPath(absoluteUrl)
      .withHeaders(this.createJsonHeaders(bearerToken))
      .withBody(body)
      .build();
  }

  private createJsonHeaders(bearerToken: string | undefined): Headers {
    const builder = new HeadersBuilder()
      .with(HeaderName.ContentType, "application/json")
      .with(HeaderName.Accept, "application/json");

    if (bearerToken !== undefined && bearerToken.trim().length > 0) {
      builder.with(HeaderName.Authorization, `Bearer ${bearerToken}`);
    }

    return builder.build();
  }
}