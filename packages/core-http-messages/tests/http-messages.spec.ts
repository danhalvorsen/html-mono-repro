// tests/code.test.ts

import { describe, expect, it } from 'vitest';

import {
  HeaderName,
  HeadersBuilder,
  type IHttpInput,
  type IHttpOutput,
  HttpAdapterComposition,
  HttpRequestMessageBuilder,
  HttpResponseMessageBuilder,
} from '../src/code';

/* =============================
   Test doubles
============================= */

class HttpInputStub implements IHttpInput {
  public constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly headers: Readonly<Record<string, string | readonly string[] | undefined>>,
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
   HttpRequestMessageBuilder
============================= */

describe('HttpRequestMessageBuilder', () => {
  it('builds request with explicit values', () => {
    const headers = new HeadersBuilder()
      .with(HeaderName.ContentType, 'application/json')
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('POST')
      .withPath('/items')
      .withHeaders(headers)
      .withBody({ id: 1 })
      .build();

    expect(request.method).toBe('POST');
    expect(request.path).toBe('/items');
    expect(request.headers.get(HeaderName.ContentType)).toBe('application/json');
    expect(request.body).toEqual({ id: 1 });
  });

  it('uses empty headers when not provided', () => {
    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('/health')
      .build();

    expect(request.headers.toObject()).toEqual({});
  });

  it('throws when method is missing', () => {
    expect(() => {
      new HttpRequestMessageBuilder()
        .withPath('/x')
        .build();
    }).toThrow('HttpRequestMessageBuilder: method is required.');
  });

  it('throws when path is missing', () => {
    expect(() => {
      new HttpRequestMessageBuilder()
        .withMethod('GET')
        .build();
    }).toThrow('HttpRequestMessageBuilder: path is required.');
  });
});

/* =============================
   HttpResponseMessageBuilder
============================= */

describe('HttpResponseMessageBuilder', () => {
  it('builds response with explicit values', () => {
    const headers = new HeadersBuilder()
      .with(HeaderName.ContentType, 'application/json')
      .build();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(201)
      .withHeaders(headers)
      .withBody({ ok: true })
      .build();

    expect(response.statusCode).toBe(201);
    expect(response.headers.get(HeaderName.ContentType)).toBe('application/json');
    expect(response.body).toEqual({ ok: true });
    expect(response.isJson()).toBe(true);
  });

  it('uses empty headers when not provided', () => {
    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .build();

    expect(response.headers.toObject()).toEqual({});
  });

  it('returns false from isJson when content-type is not application/json', () => {
    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'text/plain')
          .build(),
      )
      .withBody('ok')
      .build();

    expect(response.isJson()).toBe(false);
  });

  it('throws when status code is missing', () => {
    expect(() => {
      new HttpResponseMessageBuilder()
        .withBody('x')
        .build();
    }).toThrow('HttpResponseMessageBuilder: statusCode is required.');
  });
});

/* =============================
   Header mapping
============================= */

describe('HttpRequestMapper header mapping', () => {
  it('maps supported scalar headers', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'post',
      '/api/items',
      {
        'content-type': 'application/json',
        authorization: 'Bearer token-123',
        accept: 'application/json',
        'x-correlation-id': 'abc',
      },
      { ok: true },
    );

    const request = mapper.map(input);

    expect(request.method).toBe('POST');
    expect(request.path).toBe('/api/items');
    expect(request.headers.get(HeaderName.ContentType)).toBe('application/json');
    expect(request.headers.get(HeaderName.Authorization)).toBe('Bearer token-123');
    expect(request.headers.get(HeaderName.Accept)).toBe('application/json');
    expect(request.headers.get(HeaderName.custom('x-correlation-id'))).toBe('abc');
    expect(request.body).toEqual({ ok: true });
  });

  it('normalizes array header values into comma-separated strings', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'GET',
      '/api/items',
      {
        accept: ['application/json', 'text/plain'],
      },
      null,
    );

    const request = mapper.map(input);

    expect(request.headers.get(HeaderName.Accept)).toBe('application/json, text/plain');
  });

  it('ignores unsupported non x- headers', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'GET',
      '/api/items',
      {
        host: 'localhost',
        connection: 'keep-alive',
      },
      null,
    );

    const request = mapper.map(input);

    expect(request.headers.toObject()).toEqual({});
  });

  it('ignores invalid authorization format', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'GET',
      '/api/items',
      {
        authorization: 'Basic abc',
      },
      null,
    );

    const request = mapper.map(input);

    expect(request.headers.get(HeaderName.Authorization)).toBeUndefined();
  });

  it('ignores unsupported content-type values', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'GET',
      '/api/items',
      {
        'content-type': 'multipart/form-data',
      },
      null,
    );

    const request = mapper.map(input);

    expect(request.headers.get(HeaderName.ContentType)).toBeUndefined();
  });

  it('lowercases custom header names during mapping', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'GET',
      '/api/items',
      {
        'X-Trace-Id': 'trace-1',
      },
      null,
    );

    const request = mapper.map(input);

    expect(request.headers.get(HeaderName.custom('x-trace-id'))).toBe('trace-1');
  });

  it('throws for unsupported HTTP methods', () => {
    const mapper = HttpAdapterComposition.createRequestMapper<IHttpInput>();

    const input = new HttpInputStub(
      'TRACE',
      '/api/items',
      {},
      null,
    );

    expect(() => mapper.map(input)).toThrow('Unsupported HTTP method: TRACE');
  });
});

/* =============================
   Response writer
============================= */

describe('HttpResponseWriter', () => {
  it('writes json responses via json()', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'application/json')
          .with(HeaderName.custom('x-request-id'), 'req-1')
          .build(),
      )
      .withBody({ ok: true })
      .build();

    writer.write(output, response);

    expect(output.statusCode).toBe(200);
    expect(output.headers.get('content-type')).toBe('application/json');
    expect(output.headers.get('x-request-id')).toBe('req-1');
    expect(output.jsonBody).toEqual({ ok: true });
    expect(output.sendBody).toBeUndefined();
    expect(output.endCalled).toBe(false);
  });

  it('writes non-json responses via send()', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(202)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'text/plain')
          .build(),
      )
      .withBody('accepted')
      .build();

    writer.write(output, response);

    expect(output.statusCode).toBe(202);
    expect(output.headers.get('content-type')).toBe('text/plain');
    expect(output.sendBody).toBe('accepted');
    expect(output.jsonBody).toBeUndefined();
    expect(output.endCalled).toBe(false);
  });

  it('calls end() for null body on non-json response', () => {
    const writer = HttpAdapterComposition.createResponseWriter<IHttpOutput>();
    const output = new HttpOutputSpy();

    const response = new HttpResponseMessageBuilder()
      .withStatusCode(204)
      .build();

    writer.write(output, response);

    expect(output.statusCode).toBe(204);
    expect(output.endCalled).toBe(true);
    expect(output.sendBody).toBeUndefined();
    expect(output.jsonBody).toBeUndefined();
  });

  it('writes all headers before body', () => {
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