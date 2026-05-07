import type { IHttpRequestMessage } from "@monorepo/core-http-messages";

export interface IHttpRequestMessageFactory {
  createJsonPost(
    absoluteUrl: string,
    body: unknown,
    bearerToken: string | undefined,
  ): IHttpRequestMessage;
}