/* ============================================================
   code.ts
   HTTP Core only. No Express dependency.
============================================================ */

export type ContentType =
  | 'application/json'
  | 'text/plain'
  | 'text/html'
  | 'application/xml';

export interface HeaderValueMap {
  'content-type': ContentType;
  'authorization': `Bearer ${string}`;
  'accept': string;
  [key: `x-${string}`]: string;
}

export class HeaderName<T extends keyof HeaderValueMap = keyof HeaderValueMap> {
  private constructor(public readonly value: T) {}

  public static readonly ContentType = new HeaderName<'content-type'>('content-type');
  public static readonly Authorization = new HeaderName<'authorization'>('authorization');
  public static readonly Accept = new HeaderName<'accept'>('accept');

  public static custom<T extends `x-${string}`>(name: T): HeaderName<T> {
    return new HeaderName(name.toLowerCase() as T);
  }
}

export interface IHeaders {
  get<T extends keyof HeaderValueMap>(name: HeaderName<T>): HeaderValueMap[T] | undefined;
  toObject(): Readonly<Record<string, string>>;
}

export class Headers implements IHeaders {
  private readonly values: ReadonlyMap<string, string>;

  public constructor(values: ReadonlyMap<string, string>) {
    this.values = new Map(values);
  }

  public get<T extends keyof HeaderValueMap>(name: HeaderName<T>): HeaderValueMap[T] | undefined {
    return this.values.get(name.value) as HeaderValueMap[T] | undefined;
  }

  public toObject(): Readonly<Record<string, string>> {
    return Object.freeze(Object.fromEntries(this.values.entries()));
  }
}

export interface IHeadersBuilder {
  with<T extends keyof HeaderValueMap>(name: HeaderName<T>, value: HeaderValueMap[T]): IHeadersBuilder;
  build(): Headers;
}

export class HeadersBuilder implements IHeadersBuilder {
  private readonly values = new Map<string, string>();

  public with<T extends keyof HeaderValueMap>(name: HeaderName<T>, value: HeaderValueMap[T]): IHeadersBuilder {
    this.values.set(name.value, value);
    return this;
  }

  public build(): Headers {
    return new Headers(new Map(this.values));
  }
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface IHttpRequestMessage {
  readonly method: HttpMethod;
  readonly path: string;
  readonly headers: Headers;
  readonly body: unknown;
}

export interface IHttpResponseMessage {
  readonly statusCode: number;
  readonly headers: Headers;
  readonly body: unknown;
  isJson(): boolean;
}

export class HttpRequestMessage implements IHttpRequestMessage {
  public constructor(
    public readonly method: HttpMethod,
    public readonly path: string,
    public readonly headers: Headers,
    public readonly body: unknown,
  ) {}
}

export class HttpResponseMessage implements IHttpResponseMessage {
  public constructor(
    public readonly statusCode: number,
    public readonly headers: Headers,
    public readonly body: unknown,
  ) {}

  public isJson(): boolean {
    return this.headers.get(HeaderName.ContentType) === 'application/json';
  }
}

export class HttpRequestMessageBuilder {
  private method?: HttpMethod;
  private path?: string;
  private headers?: Headers;
  private body: unknown = undefined;

  public withMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  public withPath(path: string): this {
    this.path = path;
    return this;
  }

  public withHeaders(headers: Headers): this {
    this.headers = headers;
    return this;
  }

  public withBody(body: unknown): this {
    this.body = body;
    return this;
  }

  public build(): HttpRequestMessage {
    if (this.method === undefined) {
      throw new Error('HttpRequestMessageBuilder: method is required.');
    }

    if (this.path === undefined) {
      throw new Error('HttpRequestMessageBuilder: path is required.');
    }

    return new HttpRequestMessage(
      this.method,
      this.path,
      this.headers ?? new HeadersBuilder().build(),
      this.body,
    );
  }
}

export class HttpResponseMessageBuilder {
  private statusCode?: number;
  private headers?: Headers;
  private body: unknown = undefined;

  public withStatusCode(statusCode: number): this {
    this.statusCode = statusCode;
    return this;
  }

  public withHeaders(headers: Headers): this {
    this.headers = headers;
    return this;
  }

  public withBody(body: unknown): this {
    this.body = body;
    return this;
  }

  public build(): HttpResponseMessage {
    if (this.statusCode === undefined) {
      throw new Error('HttpResponseMessageBuilder: statusCode is required.');
    }

    return new HttpResponseMessage(
      this.statusCode,
      this.headers ?? new HeadersBuilder().build(),
      this.body,
    );
  }
}

/* ============================================================
   Transport-agnostic request/response ports
============================================================ */

export type RawHeaderValue = string | readonly string[] | undefined;

export interface IHttpInput {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, RawHeaderValue>>;
  readonly body: unknown;
}

export interface IHttpOutput {
  status(code: number): void;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
  send(body: unknown): void;
  end(): void;
}

export interface IHttpRequestMapper<TInput extends IHttpInput> {
  map(input: TInput): HttpRequestMessage;
}

export interface IHttpResponseWriter<TOutput extends IHttpOutput> {
  write(output: TOutput, message: HttpResponseMessage): void;
}

export interface IHeaderValueNormalizer {
  normalize(value: RawHeaderValue): string | undefined;
}

export class HeaderValueNormalizer implements IHeaderValueNormalizer {
  public normalize(value: RawHeaderValue): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value) && value.length > 0) {
      return value.join(', ');
    }

    return undefined;
  }
}

export interface IRequestHeaderAppender {
  tryAppend(headerName: string, headerValue: string, builder: IHeadersBuilder): boolean;
}

export class ContentTypeHeaderAppender implements IRequestHeaderAppender {
  public tryAppend(headerName: string, headerValue: string, builder: IHeadersBuilder): boolean {
    if (headerName !== HeaderName.ContentType.value) {
      return false;
    }

    if (this.isSupportedContentType(headerValue)) {
      builder.with(HeaderName.ContentType, headerValue);
    }

    return true;
  }

  private isSupportedContentType(value: string): value is ContentType {
    return (
      value === 'application/json' ||
      value === 'text/plain' ||
      value === 'text/html' ||
      value === 'application/xml'
    );
  }
}

export class AuthorizationHeaderAppender implements IRequestHeaderAppender {
  public tryAppend(headerName: string, headerValue: string, builder: IHeadersBuilder): boolean {
    if (headerName !== HeaderName.Authorization.value) {
      return false;
    }

    if (this.isBearerToken(headerValue)) {
      builder.with(HeaderName.Authorization, headerValue);
    }

    return true;
  }

  private isBearerToken(value: string): value is `Bearer ${string}` {
    return value.startsWith('Bearer ');
  }
}

export class AcceptHeaderAppender implements IRequestHeaderAppender {
  public tryAppend(headerName: string, headerValue: string, builder: IHeadersBuilder): boolean {
    if (headerName !== HeaderName.Accept.value) {
      return false;
    }

    builder.with(HeaderName.Accept, headerValue);
    return true;
  }
}

export class CustomHeaderAppender implements IRequestHeaderAppender {
  public tryAppend(headerName: string, headerValue: string, builder: IHeadersBuilder): boolean {
    if (!headerName.startsWith('x-')) {
      return false;
    }

    builder.with(HeaderName.custom(headerName as `x-${string}`), headerValue);
    return true;
  }
}

export interface IRequestHeaderMapStrategy {
  append(headers: Readonly<Record<string, RawHeaderValue>>, builder: IHeadersBuilder): void;
}

export class RequestHeaderMapStrategy implements IRequestHeaderMapStrategy {
  public constructor(
    private readonly appenders: readonly IRequestHeaderAppender[],
    private readonly normalizer: IHeaderValueNormalizer,
  ) {}

  public append(headers: Readonly<Record<string, RawHeaderValue>>, builder: IHeadersBuilder): void {
    for (const [rawName, rawValue] of Object.entries(headers)) {
      const name = rawName.toLowerCase();
      const value = this.normalizer.normalize(rawValue);

      if (value === undefined) {
        continue;
      }

      for (const appender of this.appenders) {
        if (appender.tryAppend(name, value, builder)) {
          break;
        }
      }
    }
  }
}

export class HttpRequestMapper<TInput extends IHttpInput> implements IHttpRequestMapper<TInput> {
  public constructor(private readonly headerStrategy: IRequestHeaderMapStrategy) {}

  public map(input: TInput): HttpRequestMessage {
    const headersBuilder = new HeadersBuilder();
    this.headerStrategy.append(input.headers, headersBuilder);

    return new HttpRequestMessageBuilder()
      .withMethod(this.mapMethod(input.method))
      .withPath(input.path)
      .withHeaders(headersBuilder.build())
      .withBody(input.body)
      .build();
  }

  private mapMethod(method: string): HttpMethod {
    switch (method.toUpperCase()) {
      case 'GET':
      case 'POST':
      case 'PUT':
      case 'PATCH':
      case 'DELETE':
      case 'HEAD':
      case 'OPTIONS':
        return method.toUpperCase() as HttpMethod;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}

export class HttpResponseWriter<TOutput extends IHttpOutput> implements IHttpResponseWriter<TOutput> {
  public write(output: TOutput, message: HttpResponseMessage): void {
    output.status(message.statusCode);

    const headers = message.headers.toObject();
    for (const [key, value] of Object.entries(headers)) {
      output.setHeader(key, value);
    }

    if (message.isJson()) {
      output.json(message.body);
      return;
    }

    if (message.body === undefined || message.body === null) {
      output.end();
      return;
    }

    output.send(message.body);
  }
}

/* ============================================================
   Composition root for the core mapper/writer
============================================================ */

export class HttpAdapterComposition {
  public static createRequestMapper<TInput extends IHttpInput>(): HttpRequestMapper<TInput> {
    return new HttpRequestMapper<TInput>(
      new RequestHeaderMapStrategy(
        [
          new ContentTypeHeaderAppender(),
          new AuthorizationHeaderAppender(),
          new AcceptHeaderAppender(),
          new CustomHeaderAppender(),
        ],
        new HeaderValueNormalizer(),
      ),
    );
  }

  public static createResponseWriter<TOutput extends IHttpOutput>(): HttpResponseWriter<TOutput> {
    return new HttpResponseWriter<TOutput>();
  }
}