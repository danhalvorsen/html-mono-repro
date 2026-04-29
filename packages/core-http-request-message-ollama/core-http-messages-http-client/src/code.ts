// Applications/pdf/drawing-tool/core-http-client-fetch/src/code.ts

import {
  HeaderName,
  Headers,
  HeadersBuilder,
  HttpResponseMessage,
  HttpResponseMessageBuilder,
  type ContentType,
  type HttpMethod,
  type IHttpRequestMessage,
  type IHttpResponseMessage,
} from "@monorepo/core-http-messages";

/* ============================================================
   Ports
============================================================ */

export interface IHttpClient {
  send(request: IHttpRequestMessage): Promise<IHttpResponseMessage>;
}

export interface IHttpTransport {
  execute(request: Request): Promise<Response>;
}

export interface IHttpRequestInterceptor {
  intercept(request: IHttpRequestMessage): Promise<IHttpRequestMessage>;
}

export interface IHttpResponseInterceptor {
  intercept(
    request: IHttpRequestMessage,
    response: IHttpResponseMessage,
  ): Promise<IHttpResponseMessage>;
}

export interface IHttpRequestInterceptorPipeline {
  execute(request: IHttpRequestMessage): Promise<IHttpRequestMessage>;
}

export interface IHttpResponseInterceptorPipeline {
  execute(
    request: IHttpRequestMessage,
    response: IHttpResponseMessage,
  ): Promise<IHttpResponseMessage>;
}

export interface IRequestMapper {
  map(request: IHttpRequestMessage): Request;
}

export interface IResponseMapper {
  map(response: Response): Promise<IHttpResponseMessage>;
}

export interface IResponseBodyReader {
  canRead(headers: Headers): boolean;
  read(response: Response): Promise<unknown>;
}

export interface IResponseHeaderMapper {
  map(source: globalThis.Headers): Headers;
}

/* ============================================================
   Transport
============================================================ */

export class DefaultHttpTransport implements IHttpTransport {
  public async execute(request: Request): Promise<Response> {
    return fetch(request);
  }
}

/* ============================================================
   Interceptor pipelines
============================================================ */

export class HttpRequestInterceptorPipeline
  implements IHttpRequestInterceptorPipeline
{
  public constructor(
    private readonly interceptors: readonly IHttpRequestInterceptor[],
  ) {}

  public async execute(
    request: IHttpRequestMessage,
  ): Promise<IHttpRequestMessage> {
    let current = request;

    for (const interceptor of this.interceptors) {
      current = await interceptor.intercept(current);
    }

    return current;
  }
}

export class HttpResponseInterceptorPipeline
  implements IHttpResponseInterceptorPipeline
{
  public constructor(
    private readonly interceptors: readonly IHttpResponseInterceptor[],
  ) {}

  public async execute(
    request: IHttpRequestMessage,
    response: IHttpResponseMessage,
  ): Promise<IHttpResponseMessage> {
    let current = response;

    for (const interceptor of this.interceptors) {
      current = await interceptor.intercept(request, current);
    }

    return current;
  }
}

/* ============================================================
   Request mapping
============================================================ */

export class RequestMapper implements IRequestMapper {
  public map(request: IHttpRequestMessage): Request {
    const init: RequestInit = {
      method: request.method,
      headers: this.mapHeaders(request.headers),
      body: this.mapBody(request),
    };

    return new Request(request.path, init);
  }

  private mapHeaders(headers: Headers): globalThis.Headers {
    const target = new globalThis.Headers();

    for (const [key, value] of Object.entries(headers.toObject())) {
      target.set(key, value);
    }

    return target;
  }

  private mapBody(request: IHttpRequestMessage): BodyInit | null {
    if (this.shouldOmitBody(request.method, request.body)) {
      return null;
    }

    const body = request.body;
    if (typeof body === "string") {
      return body;
    }

    if (body instanceof ArrayBuffer) {
      return body;
    }

    if (ArrayBuffer.isView(body)) {
      const copied = Uint8Array.from(
        new Uint8Array(body.buffer, body.byteOffset, body.byteLength),
      );
      return copied.buffer;
    }

    if (body instanceof Blob) {
      return body;
    }

    if (body instanceof FormData) {
      return body;
    }

    if (body instanceof URLSearchParams) {
      return body;
    }

    const contentType = request.headers.get(HeaderName.ContentType);
    if (contentType === "application/json") {
      return JSON.stringify(body);
    }

    throw new Error("Unsupported HTTP request body type.");
  }

  private shouldOmitBody(method: HttpMethod, body: unknown): boolean {
    if (body === undefined || body === null) {
      return true;
    }

    return method === "GET" || method === "HEAD";
  }
}

/* ============================================================
   Response header mapping
============================================================ */

export class ResponseHeaderMapper implements IResponseHeaderMapper {
  public map(source: globalThis.Headers): Headers {
    const builder = new HeadersBuilder();

    source.forEach((value, rawName) => {
      const name = rawName.toLowerCase();

      if (name === HeaderName.ContentType.value) {
        const normalized = this.tryNormalizeContentType(value);
        if (normalized !== undefined) {
          builder.with(HeaderName.ContentType, normalized);
        }
        return;
      }

      if (name === HeaderName.Authorization.value) {
        if (this.isBearer(value)) {
          builder.with(HeaderName.Authorization, value);
        }
        return;
      }

      if (name === HeaderName.Accept.value) {
        builder.with(HeaderName.Accept, value);
        return;
      }

      if (name.startsWith("x-")) {
        builder.with(HeaderName.custom(name as `x-${string}`), value);
      }
    });

    return builder.build();
  }

  private tryNormalizeContentType(value: string): ContentType | undefined {
    const normalized = value.split(";", 1)[0]?.trim().toLowerCase();

    if (
      normalized === "application/json" ||
      normalized === "text/plain" ||
      normalized === "text/html" ||
      normalized === "application/xml"
    ) {
      return normalized;
    }

    return undefined;
  }

  private isBearer(value: string): value is `Bearer ${string}` {
    return value.startsWith("Bearer ");
  }
}

/* ============================================================
   Response body readers
============================================================ */

export class JsonResponseBodyReader implements IResponseBodyReader {
  public canRead(headers: Headers): boolean {
    return headers.get(HeaderName.ContentType) === "application/json";
  }

  public async read(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    const text = await response.text();
    if (text.length === 0) {
      return undefined;
    }

    return JSON.parse(text);
  }
}

export class TextResponseBodyReader implements IResponseBodyReader {
  public canRead(headers: Headers): boolean {
    const contentType = headers.get(HeaderName.ContentType);
    return contentType === "text/plain" || contentType === "text/html";
  }

  public async read(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    return response.text();
  }
}

export class XmlResponseBodyReader implements IResponseBodyReader {
  public canRead(headers: Headers): boolean {
    return headers.get(HeaderName.ContentType) === "application/xml";
  }

  public async read(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    return response.text();
  }
}

export class BinaryResponseBodyReader implements IResponseBodyReader {
  public canRead(): boolean {
    return true;
  }

  public async read(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    return response.arrayBuffer();
  }
}

/* ============================================================
   Response mapping
============================================================ */

export class ResponseMapper implements IResponseMapper {
  public constructor(
    private readonly headerMapper: IResponseHeaderMapper,
    private readonly bodyReaders: readonly IResponseBodyReader[],
  ) {}

  public async map(response: Response): Promise<IHttpResponseMessage> {
    const headers = this.headerMapper.map(response.headers);
    const body = await this.readBody(response, headers);

    return new HttpResponseMessageBuilder()
      .withStatusCode(response.status)
      .withHeaders(headers)
      .withBody(body)
      .build();
  }

  private async readBody(
    response: Response,
    headers: Headers,
  ): Promise<unknown> {
    const reader = this.bodyReaders.find((candidate) =>
      candidate.canRead(headers),
    );

    if (reader === undefined) {
      throw new Error("No response body reader is registered.");
    }

    return reader.read(response);
  }
}

/* ============================================================
   Client
============================================================ */

export class HttpClient implements IHttpClient {
  public constructor(
    private readonly transport: IHttpTransport,
    private readonly requestInterceptorPipeline: IHttpRequestInterceptorPipeline,
    private readonly requestMapper: IRequestMapper,
    private readonly responseMapper: IResponseMapper,
    private readonly responseInterceptorPipeline: IHttpResponseInterceptorPipeline,
  ) {}

  public async send(
    request: IHttpRequestMessage,
  ): Promise<IHttpResponseMessage> {
    const interceptedRequest = await this.requestInterceptorPipeline.execute(
      request,
    );

    const nativeRequest = this.requestMapper.map(interceptedRequest);
    const nativeResponse = await this.transport.execute(nativeRequest);
    const mappedResponse = await this.responseMapper.map(nativeResponse);

    return this.responseInterceptorPipeline.execute(
      interceptedRequest,
      mappedResponse,
    );
  }
}

/* ============================================================
   Optional reusable interceptors
============================================================ */

export class BearerTokenRequestInterceptor implements IHttpRequestInterceptor {
  public constructor(private readonly tokenProvider: ITokenProvider) {}

  public async intercept(
    request: IHttpRequestMessage,
  ): Promise<IHttpRequestMessage> {
    const token = await this.tokenProvider.getToken();

    if (token === undefined) {
      return request;
    }

    const headers = new HeadersBuilder();
    for (const [key, value] of Object.entries(request.headers.toObject())) {
      if (key.startsWith("x-")) {
        headers.with(HeaderName.custom(key as `x-${string}`), value);
        continue;
      }

      if (key === HeaderName.ContentType.value) {
        headers.with(HeaderName.ContentType, value as ContentType);
        continue;
      }

      if (key === HeaderName.Accept.value) {
        headers.with(HeaderName.Accept, value);
      }
    }

    headers.with(HeaderName.Authorization, `Bearer ${token}`);

    return {
      ...request,
      headers: headers.build(),
    };
  }
}

export interface ITokenProvider {
  getToken(): Promise<string | undefined>;
}

export class ThrowOnErrorResponseInterceptor
  implements IHttpResponseInterceptor
{
  public async intercept(
    _request: IHttpRequestMessage,
    response: IHttpResponseMessage,
  ): Promise<IHttpResponseMessage> {
    if (response.statusCode >= 400) {
      throw new Error(
        `HTTP request failed with status code ${response.statusCode}.`,
      );
    }

    return response;
  }
}

/* ============================================================
   Composition root
============================================================ */

export class HttpClientBuilder {
  private transport: IHttpTransport = new DefaultHttpTransport();
  private requestInterceptors: IHttpRequestInterceptor[] = [];
  private responseInterceptors: IHttpResponseInterceptor[] = [];
  private requestMapper: IRequestMapper = new RequestMapper();
  private responseMapper: IResponseMapper = new ResponseMapper(
    new ResponseHeaderMapper(),
    [
      new JsonResponseBodyReader(),
      new TextResponseBodyReader(),
      new XmlResponseBodyReader(),
      new BinaryResponseBodyReader(),
    ],
  );

  public withTransport(transport: IHttpTransport): this {
    this.transport = transport;
    return this;
  }

  public withRequestMapper(mapper: IRequestMapper): this {
    this.requestMapper = mapper;
    return this;
  }

  public withResponseMapper(mapper: IResponseMapper): this {
    this.responseMapper = mapper;
    return this;
  }

  public addRequestInterceptor(interceptor: IHttpRequestInterceptor): this {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  public addResponseInterceptor(interceptor: IHttpResponseInterceptor): this {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  public build(): IHttpClient {
    return new HttpClient(
      this.transport,
      new HttpRequestInterceptorPipeline([...this.requestInterceptors]),
      this.requestMapper,
      this.responseMapper,
      new HttpResponseInterceptorPipeline([...this.responseInterceptors]),
    );
  }
}
