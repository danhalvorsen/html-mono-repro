import { describe, expect, it } from 'vitest';
import { HttpClient, HttpClientBuilder, IHttpRequestInterceptor, IHttpResponseInterceptor, IHttpTransport, RequestMapper } from '../src/code.js';
import { HeaderName, HeadersBuilder, HttpMethod, HttpRequestMessageBuilder, HttpResponseMessageBuilder, IHttpRequestMessage, IHttpResponseMessage } from '@monorepo/core-http-messages';

describe('HttpClient (fetch adapter)', () => {
  class HttpClientFixture {
    public createNativeJsonResponse(
      body: unknown,
      status = 200,
    ): Response {
      return new Response(JSON.stringify(body), {
        status,
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    public createNativeTextResponse(
      body: string,
      status = 200,
    ): Response {
      return new Response(body, {
        status,
        headers: {
          'content-type': 'text/plain',
        },
      });
    }

    public createNativeEmptyResponse(status = 200): Response {
      return new Response(null, { status });
    }
  }

  class FakeTransport implements IHttpTransport {
    public lastRequest?: Request;

    public constructor(private readonly response: Response) {}

    public async execute(request: Request): Promise<Response> {
      this.lastRequest = request;
      return this.response;
    }
  }

  class RecordingRequestInterceptor implements IHttpRequestInterceptor {
    public readonly calls: IHttpRequestMessage[] = [];

    public async intercept(
      request: IHttpRequestMessage,
    ): Promise<IHttpRequestMessage> {
      this.calls.push(request);
      return request;
    }
  }

  class RecordingResponseInterceptor implements IHttpResponseInterceptor {
    public readonly calls: Array<{
      request: IHttpRequestMessage;
      response: IHttpResponseMessage;
    }> = [];

    public async intercept(
      request: IHttpRequestMessage,
      response: IHttpResponseMessage,
    ): Promise<IHttpResponseMessage> {
      this.calls.push({ request, response });
      return response;
    }
  }

  class ReplaceResponseInterceptor implements IHttpResponseInterceptor {
    public async intercept(
      _request: IHttpRequestMessage,
      response: IHttpResponseMessage,
    ): Promise<IHttpResponseMessage> {
      return new HttpResponseMessageBuilder()
        .withStatusCode(response.statusCode)
        .withHeaders(response.headers)
        .withBody({
          wrapped: true,
          originalBody: response.body,
        })
        .build();
    }
  }

  it('exposes HttpClient', () => {
    expect(HttpClient).toBeTypeOf('function');
  });

  it('exposes RequestMapper', () => {
    expect(RequestMapper).toBeTypeOf('function');
  });

  it('sends request and maps JSON response', async () => {
    const fixture = new HttpClientFixture();

    const transport = new FakeTransport(
      fixture.createNativeJsonResponse({ ok: true }),
    );

    const client = new HttpClientBuilder()
      .withTransport(transport)
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.Accept, 'application/json')
          .build(),
      )
      .build();

    const response = await client.send(request);

    expect(response.statusCode).toBe(200);
    expect(response.isJson()).toBe(true);
    expect(response.body).toEqual({ ok: true });
  });

  it('serializes JSON request body when content-type is application/json', async () => {
    const fixture = new HttpClientFixture();

    const transport = new FakeTransport(
      fixture.createNativeJsonResponse({ ok: true }),
    );

    const client = new HttpClientBuilder()
      .withTransport(transport)
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('POST')
      .withPath('https://example.com')
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.ContentType, 'application/json')
          .build(),
      )
      .withBody({ id: 1, name: 'alpha' })
      .build();

    await client.send(request);

    expect(await transport.lastRequest!.text()).toBe(
      JSON.stringify({ id: 1, name: 'alpha' }),
    );
  });

  it('omits body for GET requests', async () => {
    const fixture = new HttpClientFixture();

    const transport = new FakeTransport(
      fixture.createNativeEmptyResponse(),
    );

    const client = new HttpClientBuilder()
      .withTransport(transport)
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .withBody({ shouldNotBeSent: true })
      .build();

    await client.send(request);

    expect(await transport.lastRequest!.text()).toBe('');
  });

  it('supports all configured HTTP verbs', async () => {
    const fixture = new HttpClientFixture();

    const methods: HttpMethod[] = [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'HEAD',
      'OPTIONS',
    ];

    for (const method of methods) {
      const transport = new FakeTransport(
        fixture.createNativeEmptyResponse(),
      );

      const client = new HttpClientBuilder()
        .withTransport(transport)
        .build();

      const request = new HttpRequestMessageBuilder()
        .withMethod(method)
        .withPath('https://example.com')
        .build();

      await client.send(request);

      expect(transport.lastRequest!.method).toBe(method);
    }
  });

  it('executes request interceptors in order', async () => {
    const fixture = new HttpClientFixture();

    const first = new RecordingRequestInterceptor();
    const second = new RecordingRequestInterceptor();

    const client = new HttpClientBuilder()
      .withTransport(new FakeTransport(fixture.createNativeEmptyResponse()))
      .addRequestInterceptor(first)
      .addRequestInterceptor(second)
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .build();

    await client.send(request);

    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
    expect(first.calls[0]).toBe(request);
    expect(second.calls[0]).toBe(request);
  });

  it('executes response interceptors in order', async () => {
    const fixture = new HttpClientFixture();

    const first = new RecordingResponseInterceptor();
    const second = new RecordingResponseInterceptor();

    const client = new HttpClientBuilder()
      .withTransport(
        new FakeTransport(
          fixture.createNativeJsonResponse({ ok: true }),
        ),
      )
      .addResponseInterceptor(first)
      .addResponseInterceptor(second)
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .build();

    await client.send(request);

    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
    expect(first.calls[0]!.request).toBe(request);
    expect(second.calls[0]!.request).toBe(request);
  });

  it('allows response interceptors to replace the mapped response using the response builder', async () => {
    const fixture = new HttpClientFixture();

    const client = new HttpClientBuilder()
      .withTransport(
        new FakeTransport(
          fixture.createNativeJsonResponse({ ok: true }),
        ),
      )
      .addResponseInterceptor(new ReplaceResponseInterceptor())
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .build();

    const response = await client.send(request);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      wrapped: true,
      originalBody: { ok: true },
    });
  });

  it('maps text response correctly', async () => {
    const fixture = new HttpClientFixture();

    const client = new HttpClientBuilder()
      .withTransport(
        new FakeTransport(
          fixture.createNativeTextResponse('hello'),
        ),
      )
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .build();

    const response = await client.send(request);

    expect(response.statusCode).toBe(200);
    expect(response.isJson()).toBe(false);
    expect(response.body).toBe('hello');
  });

  it('maps empty response to undefined body', async () => {
    const fixture = new HttpClientFixture();

    const client = new HttpClientBuilder()
      .withTransport(
        new FakeTransport(
          fixture.createNativeEmptyResponse(204),
        ),
      )
      .build();

    const request = new HttpRequestMessageBuilder()
      .withMethod('GET')
      .withPath('https://example.com')
      .build();

    const response = await client.send(request);

    expect(response.statusCode).toBe(204);
    expect(response.body).toBeUndefined();
  });
});