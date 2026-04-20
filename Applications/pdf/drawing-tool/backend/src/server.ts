import express, { type Response } from 'express';
import type { Server as HttpServer } from 'node:http';
import path from 'node:path';
import type { ICommand } from '@monorepo/core-design-patterns-cqrs';
import { Mediator } from '@monorepo/core-design-patterns-mediator';
import {
  HeadersBuilder,
  HeaderName,
  HttpResponseMessageBuilder,
  type HttpRequestMessage,
  type HttpResponseMessage,
} from '@monorepo/core-http-messages';
import {
  ExpressHttpAdapterComposition,
  type IExpressHandler,
} from '@monorepo/core-http-messages-express';
import { Json } from '@monorepo/core-json';
import { SaveCommand } from './features/saveFeature/SaveCommand.js';
import { SaveCommandHandler } from './features/saveFeature/SaveCommandHandler.js';
import { SaveCommandPipeline } from './features/saveFeature/SaveCommandPipeline.js';

type RequestLogEntry = {
  receivedAt: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
};

export interface ServerOptions {
  readonly saveDirectory?: string;
}

class ServerOptionsModel {
  public constructor(
    public readonly saveDirectory?: string,
  ) {}

  public static from(options: ServerOptions): ServerOptionsModel {
    return new ServerOptionsModel(options.saveDirectory);
  }

  public toString(): string {
    return JSON.stringify({
      saveDirectory: this.saveDirectory ?? null,
    });
  }
}

export class Server {
   
  private readonly app = express();
  private readonly port: number;
  private readonly routes = ExpressHttpAdapterComposition.createRouteHandlerFactory();
  private readonly requestLog: RequestLogEntry[] = [];
  private readonly clients = new Set<Response>();
  private readonly saveCommandHandler: SaveCommandHandler;
  private readonly saveDirectory: string;
  private httpServer: HttpServer | null = null;

  public constructor(port: number, options: ServerOptions = {}) {
    const normalizedOptions = ServerOptionsModel.from(options);
    console.log(`[Server] Initializing with options: ${normalizedOptions.toString()}`);
    this.port = port;
    this.saveDirectory = normalizedOptions.saveDirectory ?? path.resolve(process.cwd(), 'data', 'saves');
    this.saveCommandHandler = this.createDefaultSaveCommandHandler();

    this.app.use(express.json());
    this.app.use((req, _res, next) => {
      console.log('[Server] HTTP request received', {
        method: req.method,
        path: req.path,
        contentType: req.headers['content-type'] ?? null,
      });
      next();
    });
    this.app.use(express.static(this.resolvePublic()));

    this.mapRoutes();
  }

  public async start(): Promise<void> {
    if (this.httpServer) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.httpServer = this.app.listen(this.port, () => {
        console.log(`Server running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.httpServer) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.httpServer?.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    this.httpServer = null;
  }

  private mapRoutes(): void {
    this.app.get(
      '/api/request-log',
      this.routes.create(new RequestLogHandler(() => this.requestLog)),
    );

    this.app.get('/api/request-stream', (_req, res) => {
      this.handleSse(res);
    });

    this.app.post(
      '/api/commands/save',
      this.routes.create(
        new SaveCommandHttpHandler(
          this.saveCommandHandler,
          (entry) => this.appendLog(entry),
        ),
      ),
    );

    this.app.all(
      '/api/*path',
      this.routes.create(new ApiRequestHandler((entry) => this.appendLog(entry))),
    );
  }

  private createDefaultSaveCommandHandler(): SaveCommandHandler {
    return new SaveCommandHandler(
      new Mediator(
        new SaveCommandPipeline(this.saveDirectory),
      ),
    );
  }

  private handleSse(res: Response): void {
    res.setHeader('content-type', 'text/event-stream');
    res.setHeader('cache-control', 'no-cache');
    res.setHeader('connection', 'keep-alive');

    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  private appendLog(entry: RequestLogEntry): void {
    this.requestLog.unshift(entry);
    this.broadcast({
      type: 'request',
      entry,
    });
  }

  private broadcast(payload: unknown): void {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      client.write(data);
    }
  }

  private resolvePublic(): string {
    return path.resolve(process.cwd(), 'public');
  }
}

class RequestLogHandler implements IExpressHandler {
  public constructor(
    private readonly readEntries: () => ReadonlyArray<RequestLogEntry>,
  ) {}

  public handle(_request: HttpRequestMessage): HttpResponseMessage {
    return new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(createJsonHeaders())
      .withBody({ data: { entries: this.readEntries() } })
      .build();
  }
}

class SaveCommandHttpHandler implements IExpressHandler {
  public constructor(
    private readonly saveCommandHandler: SaveCommandHandler,
    private readonly appendEntry: (entry: RequestLogEntry) => void,
  ) {}

  public async handle(request: HttpRequestMessage): Promise<HttpResponseMessage> {
    const startedAt = Date.now();
    if (isInspectMode()) {
      debugger;
    }
    try {
      const payload = isRecord(request.body) ? request.body : {};
      console.log('[Server] Save command request mapped', {
        method: request.method,
        path: request.path,
        payloadKeys: Object.keys(payload),
      });
      const command: ICommand<SaveCommand> = {
        json: Json.serialize(payload as Json.Value),
      };

      console.log('[Server] Dispatching SaveCommand to command handler.');
      const result = await this.saveCommandHandler.Handle(command);
      if (result.isErr()) {
        console.log('[Server] SaveCommand dispatch failed.', {
          reason: result.unwrapErr(),
        });
        this.appendEntry({
          receivedAt: new Date().toISOString(),
          method: request.method,
          path: request.path,
          statusCode: 400,
          durationMs: Date.now() - startedAt,
        });
        return new HttpResponseMessageBuilder()
          .withStatusCode(400)
          .withHeaders(createJsonHeaders())
          .withBody({ ok: false, error: result.unwrapErr() })
          .build();
      }

      console.log('[Server] SaveCommand dispatch succeeded.', {
        durationMs: Date.now() - startedAt,
      });
      this.appendEntry({
        receivedAt: new Date().toISOString(),
        method: request.method,
        path: request.path,
        statusCode: 202,
        durationMs: Date.now() - startedAt,
      });
      return new HttpResponseMessageBuilder()
        .withStatusCode(202)
        .withHeaders(createJsonHeaders())
        .withBody({ ok: true, data: result.unwrap() })
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected save command HTTP error.';
      console.log('[Server] SaveCommand request failed with exception.', {
        error: message,
      });
      this.appendEntry({
        receivedAt: new Date().toISOString(),
        method: request.method,
        path: request.path,
        statusCode: 500,
        durationMs: Date.now() - startedAt,
      });
      return new HttpResponseMessageBuilder()
        .withStatusCode(500)
        .withHeaders(createJsonHeaders())
        .withBody({ ok: false, error: message })
        .build();
    }
  }
}

class ApiRequestHandler implements IExpressHandler {
  public constructor(
    private readonly appendEntry: (entry: RequestLogEntry) => void,
  ) {}

  public handle(request: HttpRequestMessage): HttpResponseMessage {
    const startedAt = Date.now();
    this.appendEntry({
      receivedAt: new Date().toISOString(),
      method: request.method,
      path: request.path,
      statusCode: 200,
      durationMs: Date.now() - startedAt,
    });

    return new HttpResponseMessageBuilder()
      .withStatusCode(200)
      .withHeaders(createJsonHeaders())
      .withBody({ ok: true })
      .build();
  }
}

function createJsonHeaders(): ReturnType<HeadersBuilder['build']> {
  return new HeadersBuilder()
    .with(HeaderName.ContentType, 'application/json')
    .build();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInspectMode(): boolean {
  return process.execArgv.some((arg) => arg.startsWith('--inspect'));
}

if (!process.env.VITEST) {
  const server = new Server(3000);
  void server.start();
}
