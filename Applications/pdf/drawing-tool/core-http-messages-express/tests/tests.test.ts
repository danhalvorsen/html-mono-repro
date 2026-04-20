// Applications/pdf/drawing-tool/core-http-messages-express/tests/tests.test.ts

import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
  HttpResponseMessageBuilder,
} from '@monorepo/core-http-messages';

import {
  ExpressHttpInput,
  ExpressHttpOutput,
  ExpressRequestAdapter,
  ExpressResponseAdapter,
  ExpressRouteHandlerFactory,
  type IExpressHandler,
} from '../src/code.js';

describe('ExpressHttpInput', () => {
  it('should expose express request values through IHttpInput shape', () => {
    const request = {
      method: 'POST',
      path: '/api/test',
      headers: {
        'content-type': 'application/json',
        'x-trace-id': 'trace-1',
      },
      body: { ok: true },
    } as unknown as Request;

    const input = new ExpressHttpInput(request);

    expect(input.method).toBe('POST');
    expect(input.path).toBe('/api/test');
    expect(input.headers['content-type']).toBe('application/json');
    expect(input.headers['x-trace-id']).toBe('trace-1');
    expect(input.body).toEqual({ ok: true });
  });
});

describe('ExpressHttpOutput', () => {
  it('should forward all output operations to express response', () => {
    const response = {
      status: vi.fn(),
      setHeader: vi.fn(),
      json: vi.fn(),
      send: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const output = new ExpressHttpOutput(response);

    output.status(201);
    output.setHeader('x-test', '1');
    output.json({ ok: true });
    output.send('hello');
    output.end();

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.setHeader).toHaveBeenCalledWith('x-test', '1');
    expect(response.json).toHaveBeenCalledWith({ ok: true });
    expect(response.send).toHaveBeenCalledWith('hello');
    expect(response.end).toHaveBeenCalledTimes(1);
  });
});

describe('ExpressRequestAdapter', () => {
  it('should adapt express request into HttpRequestMessage', () => {
    const mappedRequest = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('/api/health')
      .withBody(null)
      .build();

    const mapper = {
      map: vi.fn().mockReturnValue(mappedRequest),
    };

    const adapter = new ExpressRequestAdapter(mapper);

    const request = {
      method: 'GET',
      path: '/api/health',
      headers: {},
      body: null,
    } as unknown as Request;

    const result = adapter.adapt(request);

    expect(mapper.map).toHaveBeenCalledTimes(1);
    expect(result).toBe(mappedRequest);
  });
});

describe('ExpressResponseAdapter', () => {
  it('should adapt HttpResponseMessage to express response through writer', () => {
    const writer = {
      write: vi.fn(),
    };

    const adapter = new ExpressResponseAdapter(writer);

    const response = {} as Response;
    const message = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'application/json')
          .build(),
      )
      .withBody({ ok: true })
      .build();

    adapter.adapt(response, message);

    expect(writer.write).toHaveBeenCalledWith(expect.any(ExpressHttpOutput), message);
  });
});

describe('ExpressRouteHandlerFactory', () => {
  it('should create express handler that adapts request and response', async () => {
    const coreRequest = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('/api/health')
      .withBody(null)
      .build();

    const coreResponse = new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withBody({ ok: true })
      .build();

    const requestAdapter = {
      adapt: vi.fn().mockReturnValue(coreRequest),
    };

    const responseAdapter = {
      adapt: vi.fn(),
    };

    const handler: IExpressHandler = {
      handle: vi.fn().mockResolvedValue(coreResponse),
    };

    const factory = new ExpressRouteHandlerFactory(
      requestAdapter,
      responseAdapter,
    );

    const expressHandler = factory.create(handler);

    const request = {} as Request;
    const response = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    await expressHandler(request, response, next);

    expect(requestAdapter.adapt).toHaveBeenCalledWith(request);
    expect(handler.handle).toHaveBeenCalledWith(coreRequest);
    expect(responseAdapter.adapt).toHaveBeenCalledWith(response, coreResponse);
    expect(next).not.toHaveBeenCalled();
  });

  it('should forward thrown error to next', async () => {
    const failure = new Error('boom');

    const requestAdapter = {
      adapt: vi.fn().mockReturnValue(
        new HttpRequestMessageBuilder()
          .withMethod('GET')
          .withPath('/x')
          .withBody(null)
          .build(),
      ),
    };

    const responseAdapter = {
      adapt: vi.fn(),
    };

    const handler: IExpressHandler = {
      handle: vi.fn().mockRejectedValue(failure),
    };

    const factory = new ExpressRouteHandlerFactory(
      requestAdapter,
      responseAdapter,
    );

    const expressHandler = factory.create(handler);

    const next = vi.fn() as unknown as NextFunction;

    await expressHandler({} as Request, {} as Response, next);

    expect(next).toHaveBeenCalledWith(failure);
    expect(responseAdapter.adapt).not.toHaveBeenCalled();
  });
});

describe('ExpressHttpInput', () => {
  it('should preserve undefined body', () => {});
  it('should preserve empty headers object', () => {});
});

describe('ExpressHttpOutput', () => {
  it('should allow multiple header writes', () => {});
});

describe('ExpressRouteHandlerFactory', () => {
  it('should support synchronous handler result', async () => {});
  it('should support synchronous handler throw', async () => {});
});

describe('ExpressHttpAdapterComposition', () => {
  it('should create request adapter', () => {});
  it('should create response adapter', () => {});
  it('should create route handler factory', () => {});
  it('should create route handler', async () => {});
});