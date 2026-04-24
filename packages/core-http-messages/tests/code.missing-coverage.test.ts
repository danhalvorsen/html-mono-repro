// tests/code.missing-coverage.test.ts

import { describe, expect, it } from 'vitest';

import {
  HeaderName,
  Headers,
  HeadersBuilder,
  HeaderValueNormalizer,
  HttpAdapterComposition,
  HttpRequestMessage,
  HttpRequestMessageBuilder,
  HttpResponseMessage,
  HttpResponseMessageBuilder,
  RequestHeaderMapStrategy,
  ContentTypeHeaderAppender,
  AuthorizationHeaderAppender,
  AcceptHeaderAppender,
  CustomHeaderAppender,
  type IHttpInput,
  type IHttpOutput,
  type RawHeaderValue,
} from '../src/code';

/* =============================
   Test doubles
============================= */

class HttpInputStub implements IHttpInput {
  public constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly headers: Readonly<Record<string, RawHeaderValue>>,
    public readonly body: unknown,
  ) {}
}

class HttpOutputSpy implements IHttpOutput {
  public statusCode: number | null = null;
  public readonly headers = new Map<string, string>();
  public jsonBody: unknown = undefined;
  public sendBody: unknown = undefined;
  public endCalled = false;

  public status(code: number): void {
    this.statusCode = code;
  }

  public setHeader(name: string, value: string): void {
    this.headers.set(name, value);
  }

  public json(body: unknown): void {
    this.jsonBody = body;
  }

  public send(body: unknown): void {
    this.sendBody = body;
  }

  public end(): void {
    this.endCalled = true;
  }
}

/* =============================
   Headers
============================= */

describe('Headers', () => {
  it('returns undefined for missing header', () => {
    const headers = new HeadersBuilder().build();

    expect(headers.get(HeaderName.ContentType)).toBeUndefined();
  });

  it('toObject returns immutable snapshot', () => {
    const headers = new HeadersBuilder()
      .with(HeaderName.Accept, 'application/json')
      .build();

    const snapshot = headers.toObject();

    expect(snapshot).toEqual({ accept: 'application/json' });
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('does not expose internal mutation through constructor map', () => {
    const values = new Map<string, string>();
    values.set('accept', 'application/json');

    const headers = new Headers(values);
    values.set('accept', 'text/plain');

    expect(headers.get(HeaderName.Accept)).toBe('application/json');
  });

  it('builder overwrites same header with latest value', () => {
    const headers = new HeadersBuilder()
      .with(HeaderName.Accept, 'application/json')
      .with(HeaderName.Accept, 'text/plain')
      .build();

    expect(headers.get(HeaderName.Accept)).toBe('text/plain');
  });

  it('stores and resolves custom headers', () => {
    const headers = new HeadersBuilder()
      .with(HeaderName.custom('x-correlation-id'), 'abc-1')
      .build();

    expect(headers.get(HeaderName.custom('x-correlation-id'))).toBe('abc-1');
  });
});

/* =============================
   HeaderValueNormalizer
============================= */

describe('HeaderValueNormalizer', () => {
  it('returns scalar string as-is', () => {
    const normalizer = new HeaderValueNormalizer();

    expect(normalizer.normalize('application/json')).toBe('application/json');
  });

  it('joins array values with comma separator', () => {
    const normalizer = new HeaderValueNormalizer();

    expect(normalizer.normalize(['a', 'b'])).toBe('a, b');
  });

  it('returns undefined for empty array', () => {
    const normalizer = new HeaderValueNormalizer();

    expect(normalizer.normalize([])).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    const normalizer = new HeaderValueNormalizer();

    expect(normalizer.normalize(undefined)).toBeUndefined();
  });
});

/* =============================
   RequestHeaderMapStrategy
============================= */

describe('RequestHeaderMapStrategy', () => {
  const createStrategy = (): RequestHeaderMapStrategy =>
    new RequestHeaderMapStrategy(
      [
        new ContentTypeHeaderAppender(),
        new AuthorizationHeaderAppender(),
        new AcceptHeaderAppender(),
        new CustomHeaderAppender(),
      ],
      new HeaderValueNormalizer(),
    );

  it('maps recognized headers only', () => {
    const strategy = createStrategy();
    const builder = new HeadersBuilder();

    strategy.append(
      {
        accept: 'application/json',
        host: 'localhost',
        'x-test': '1',
      },
      builder,
    );

    const headers = builder.build();

    expect(headers.get(HeaderName.Accept)).toBe('application/json');
    expect(headers.get(HeaderName.custom('x-test'))).toBe('1');
    expect(headers.toObject()).toEqual({
      accept: 'application/json',
      'x-test': '1',
    });
  });

  it('normalizes header names to lowercase before mapping', () => {
    const strategy = createStrategy();
    const builder = new HeadersBuilder();

    strategy.append(
      {
        ACCEPT: 'application/json',
        'X-TRACE-ID': 'trace-1',
      },
      builder,
    );

    const headers = builder.build();

    expect(headers.get(HeaderName.Accept)).toBe('application/json');
    expect(headers.get(HeaderName.custom('x-trace-id'))).toBe('trace-1');
  });

  it('ignores invalid bearer authorization values', () => {
    const strategy = createStrategy();
    const builder = new HeadersBuilder();

    strategy.append(
      {
        authorization: 'Basic abc',
      },
      builder,
    );

    const headers = builder.build();

    expect(headers.get(HeaderName.Authorization)).toBeUndefined();
  });

  it('ignores unsupported content-type values', () => {
    const strategy = createStrategy();
    const builder = new HeadersBuilder();

    strategy.append(
      {
        'content-type': 'multipart/form-data',
      },
      builder,
    );

    const headers = builder.build();

    expect(headers.get(HeaderName.ContentType)).toBeUndefined();
  });

  it('accepts valid supported content-type values', () => {
    const strategy = createStrategy();
    const builder = new HeadersBuilder();

    strategy.append(
      {
        'content-type': 'text/plain',
      },
      builder,
    );

    const headers = builder.build();

    expect(headers.get(HeaderName.ContentType)).toBe('text/plain');
  });
});

/* =============================
   HttpRequestMessage
============================= */

describe('HttpRequestMessage', () => {
  it('is immutable by exposed readonly contract', () => {
    const request = new HttpRequestMessage(
      'GET',
      '/x',
      new HeadersBuilder().build(),
      { ok: true },
    );

    expect(request.method).toBe('GET');
    expect(request.path).toBe('/x');
    expect(request.body).toEqual({ ok: true });
  });

  it('builder preserves explicit null body', () => {
    const request = new HttpRequestMessageBuilder()
      .withMethod('POST')
      .withPath('/x')
      .withBody(null)
      .build();

    expect(request.body).toBeNull();
  });

  it('builder preserves explicit primitive body', () => {
    const request = new HttpRequestMessageBuilder()
      .withMethod('POST')
      .withPath('/x')
      .withBody(123)
      .build();

    expect(request.body).toBe(123);
  });
});

/* =============================
   HttpResponseMessage
============================= */

describe('HttpResponseMessage', () => {
  it('isJson returns true only for exact application/json', () => {
    const response = new HttpResponseMessage(
      200,
      new HeadersBuilder()
        .with(HeaderName.ContentType, 'application/json')
        .build(),
      {},
    );

    expect(response.isJson()).toBe(true);
  });

  it('isJson returns false when content-type is missing', () => {
    const response = new HttpResponseMessage(
      200,
      new HeadersBuilder().build(),
      {},
    );

    expect(response.isJson()).toBe(false);
  });

  it('preserves null body', () => {
    const response = new HttpResponseMessageBuilder()
      .withStatusCode(204)
      .withBody(null)
      .build();

    expect(response.body).toBeNull();
  });

  it('preserves primitive body', () => {
    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withBody(123)
      .build();

    expect(response.body).toBe(123);
  });
});

/* =============================
   HttpRequestMapper
============================= */

describe('HttpRequestMapper', () => {
  it('maps all supported HTTP methods', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

    for (const method of methods) {
      const request = mapper.map(new HttpInputStub(method, '/x', {}, null));
      expect(request.method).toBe(method);
    }
  });

  it('uppercases lowercase HTTP methods', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const request = mapper.map(new HttpInputStub('post', '/x', {}, null));

    expect(request.method).toBe('POST');
  });

  it('passes through body unchanged', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();
    const payload = { ok: true };

    const request = mapper.map(new HttpInputStub('POST', '/x', {}, payload));

    expect(request.body).toBe(payload);
  });

  it('creates empty headers when input has no supported headers', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const request = mapper.map(
      new HttpInputStub('GET', '/x', { host: 'localhost' }, null),
    );

    expect(request.headers.toObject()).toEqual({});
  });
});

/* =============================
   HttpResponseWriter
============================= */

describe('HttpResponseWriter', () => {
  it('writes status for every response', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(201)
      .withBody('created')
      .build();

    writer.write(output, response);

    expect(output.statusCode).toBe(201);
  });

  it('writes plain text body through send', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'text/plain')
          .build(),
      )
      .withBody('hello')
      .build();

    writer.write(output, response);

    expect(output.sendBody).toBe('hello');
    expect(output.jsonBody).toBeUndefined();
    expect(output.endCalled).toBe(false);
  });

  it('writes primitive non-json body through send', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withBody(123)
      .build();

    writer.write(output, response);

    expect(output.sendBody).toBe(123);
    expect(output.endCalled).toBe(false);
  });

  it('calls end for undefined non-json body', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(204)
      .build();

    writer.write(output, response);

    expect(output.endCalled).toBe(true);
    expect(output.sendBody).toBeUndefined();
    expect(output.jsonBody).toBeUndefined();
  });

  it('calls json when content-type is application/json even for null body', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'application/json')
          .build(),
      )
      .withBody(null)
      .build();

    writer.write(output, response);

    expect(output.jsonBody).toBeNull();
    expect(output.sendBody).toBeUndefined();
    expect(output.endCalled).toBe(false);
  });

  it('writes all headers to output', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.Accept, 'application/json')
          .with(HeaderName.custom('x-test'), '1')
          .build(),
      )
      .withBody('ok')
      .build();

    writer.write(output, response);

    expect(output.headers.get('accept')).toBe('application/json');
    expect(output.headers.get('x-test')).toBe('1');
  });
});

/* =============================
   Composition root
============================= */

describe('HttpAdapterComposition', () => {
  it('creates independent mapper instances', () => {
    const left = HttpAdapterComposition.createRequestMapper<IHttpInput>();
    const right = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    expect(left).not.toBe(right);
  });

  it('creates independent writer instances', () => {
    const left = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const right = HttpAdapterComposition.createResponseWriter<IHttpOutput>();

    expect(left).not.toBe(right);
  });
});