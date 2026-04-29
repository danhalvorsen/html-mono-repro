// Applications/pdf/drawing-tool/core-http-messages-express/src/code.ts

import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

import {
  type HttpRequestMessage,
  type HttpResponseMessage,
  type IHttpInput,
  type IHttpOutput,
  type IHttpRequestMapper,
  type IHttpResponseWriter,
  type RawHeaderValue,
  HttpAdapterComposition,
} from '@monorepo/core-http-messages';

/* ============================================================
   Adapter contracts
============================================================ */

export interface IExpressHandler {
  handle(request: HttpRequestMessage): Promise<HttpResponseMessage> | HttpResponseMessage;
}

export interface IExpressRequestAdapter {
  adapt(request: Request): HttpRequestMessage;
}

export interface IExpressResponseAdapter {
  adapt(response: Response, message: HttpResponseMessage): void;
}

export interface IExpressRouteHandlerFactory {
  create(handler: IExpressHandler): RequestHandler;
}

/* ============================================================
   Express -> core-http-messages input port
============================================================ */

export class ExpressHttpInput implements IHttpInput {
  public readonly method: string;
  public readonly path: string;
  public readonly headers: Readonly<Record<string, RawHeaderValue>>;
  public readonly body: unknown;

  public constructor(request: Request) {
    this.method = request.method;
    this.path = request.path;
    this.headers = request.headers as Readonly<Record<string, RawHeaderValue>>;
    this.body = request.body;
  }
}

/* ============================================================
   core-http-messages output port -> Express
============================================================ */

export class ExpressHttpOutput implements IHttpOutput {
  public constructor(private readonly response: Response) {}

  public status(code: number): void {
    this.response.status(code);
  }

  public setHeader(name: string, value: string): void {
    this.response.setHeader(name, value);
  }

  public json(body: unknown): void {
    this.response.json(body);
  }

  public send(body: unknown): void {
    this.response.send(body);
  }

  public end(): void {
    this.response.end();
  }
}

/* ============================================================
   Adapters
============================================================ */

export class ExpressRequestAdapter implements IExpressRequestAdapter {
  public constructor(
    private readonly mapper: IHttpRequestMapper<IHttpInput>,
  ) {}

  public adapt(request: Request): HttpRequestMessage {
    return this.mapper.map(new ExpressHttpInput(request));
  }
}

export class ExpressResponseAdapter implements IExpressResponseAdapter {
  public constructor(
    private readonly writer: IHttpResponseWriter<IHttpOutput>,
  ) {}

  public adapt(response: Response, message: HttpResponseMessage): void {
    this.writer.write(new ExpressHttpOutput(response), message);
  }
}

/* ============================================================
   Route handler factory
============================================================ */

export class ExpressRouteHandlerFactory implements IExpressRouteHandlerFactory {
  public constructor(
    private readonly requestAdapter: IExpressRequestAdapter,
    private readonly responseAdapter: IExpressResponseAdapter,
  ) {}

  public create(handler: IExpressHandler): RequestHandler {
    return async (
      request: Request,
      response: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const httpRequest = this.requestAdapter.adapt(request);
        const httpResponse = await handler.handle(httpRequest);
        this.responseAdapter.adapt(response, httpResponse);
      } catch (error) {
        next(error);
      }
    };
  }
}

/* ============================================================
   Composition root
============================================================ */

export class ExpressHttpAdapterComposition {
  public static createRequestAdapter(): IExpressRequestAdapter {
    return new ExpressRequestAdapter(
      HttpAdapterComposition.createRequestMapper<IHttpInput>(),
    );
  }

  public static createResponseAdapter(): IExpressResponseAdapter {
    return new ExpressResponseAdapter(
      HttpAdapterComposition.createResponseWriter<IHttpOutput>(),
    );
  }

  public static createRouteHandlerFactory(): IExpressRouteHandlerFactory {
    return new ExpressRouteHandlerFactory(
      this.createRequestAdapter(),
      this.createResponseAdapter(),
    );
  }

  public static createRouteHandler(handler: IExpressHandler): RequestHandler {
    return this.createRouteHandlerFactory().create(handler);
  }
}