import {
  HeaderName,
  Headers,
  HeadersBuilder,
  HttpRequestMessageBuilder,
  type IHttpRequestMessage,
} from "@monorepo/core-http-messages";

export interface IHttpRequestMessageFactory<TRequest> {
  create(request: TRequest): IHttpRequestMessage;
}

export interface IHttpEmptyRequestMessageFactory {
  create(): IHttpRequestMessage;
}

export class HttpHeaders {
  public static json(): Headers {
    return new HeadersBuilder()
      .with(HeaderName.ContentType, "application/json")
      .with(HeaderName.Accept, "application/json")
      .build();
  }

  public static acceptJson(): Headers {
    return new HeadersBuilder()
      .with(HeaderName.Accept, "application/json")
      .build();
  }
}

export abstract class JsonPostRequestMessageFactory<TRequest>
  implements IHttpRequestMessageFactory<TRequest>
{
  protected constructor(private readonly absolutePath: string) {}

  public create(request: TRequest): IHttpRequestMessage {
    return new HttpRequestMessageBuilder()
      .withMethod("POST")
      .withPath(this.absolutePath)
      .withHeaders(HttpHeaders.json())
      .withBody(request)
      .build();
  }
}

export abstract class JsonGetRequestMessageFactory
  implements IHttpEmptyRequestMessageFactory
{
  protected constructor(private readonly absolutePath: string) {}

  public create(): IHttpRequestMessage {
    return new HttpRequestMessageBuilder()
      .withMethod("GET")
      .withPath(this.absolutePath)
      .withHeaders(HttpHeaders.acceptJson())
      .build();
  }
}