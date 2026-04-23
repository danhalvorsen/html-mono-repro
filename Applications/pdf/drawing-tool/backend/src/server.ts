import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import type { Server as HttpServer } from 'node:http';
import type { ICommand } from '@monorepo/core-design-patterns-cqrs';
import { Mediator } from '@monorepo/core-design-patterns-mediator';
import { Json } from '@monorepo/core-json';
import { SaveCommand } from './features/saveFeature/SaveCommand.js';
import { SaveCommandHandler } from './features/saveFeature/SaveCommandHandler.js';
import { SaveCommandPipeline } from './features/saveFeature/SaveCommandPipeline.js';
import { loadBackendConfiguration, type BackendConfiguration } from './configuration.js';

export interface ServerOptions {
  readonly saveDirectory?: string;
  readonly configuration?: BackendConfiguration;
}

export class Server {
  private readonly app: Express;
  private readonly port: number;
  private readonly saveCommandHandler: SaveCommandHandler;
  private httpServer: HttpServer | null = null;

  public constructor(port: number, options: ServerOptions = {}) {
    this.app = express();
    this.port = port;

    const configuration =
      options.configuration ?? loadBackendConfiguration();
    const effectiveConfiguration = options.saveDirectory
      ? {
          ...configuration,
          saveDirectoryPath: options.saveDirectory,
        }
      : configuration;

    console.log(
      `[Server] Initializing with options: ${JSON.stringify(effectiveConfiguration)}`,
    );

    this.saveCommandHandler = new SaveCommandHandler(
      new Mediator(new SaveCommandPipeline(effectiveConfiguration.saveDirectoryPath)),
    );

    this.configureMiddleware();
    this.mapRoutes();
  }

  public async start(): Promise<void> {
    if (this.httpServer !== null) {
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
    if (this.httpServer === null) {
      return;
    }

    const server = this.httpServer;
    this.httpServer = null;

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private configureMiddleware(): void {
    this.app.use((req, res, next) => {
      if (req.path.startsWith('/ws/socket.io/')) {
        res.status(404).end();
        return;
      }

      next();
    });

    this.app.use((req, _res, next) => {
      console.log('[Server] HTTP request received', {
        method: req.method,
        path: req.path,
        contentType: req.headers['content-type'] ?? null,
      });
      next();
    });

    this.app.use(express.json());
    this.app.use(
      (error: unknown, req: Request, res: Response, next: NextFunction) => {
        if (isJsonParseError(error)) {
          console.log('[Server] JSON parse failed', {
            method: req.method,
            path: req.path,
            error: error.message,
          });
          res.status(400).json({ ok: false, error: error.message });
          return;
        }

        next(error);
      },
    );
  }

  private mapRoutes(): void {
    this.app.post(['/save', '/api/commands/save', '/api/save'], async (req, res) => {
      await this.handleSaveCommand(req, res);
    });

    this.app.all('/api/*path', (req, res) => {
      console.log('[Server] Unmapped API request', {
        method: req.method,
        path: req.path,
      });
      res.status(404).json({
        ok: false,
        error: `No route mapped for ${req.method} ${req.path}`,
      });
    });
  }

  private async handleSaveCommand(req: Request, res: Response): Promise<void> {
    const startedAt = Date.now();

    if (isInspectMode()) {
      debugger;
    }

    try {
      const rectangles = extractRectangles(req.body);
      console.log('[Server] Save command request mapped', {
        method: req.method,
        path: req.path,
        rectangleCount: rectangles.length,
      });

      const command: ICommand<SaveCommand> = {
        json: Json.serialize({ rectangles } as Json.Value),
      };

      console.log('[Server] Dispatching SaveCommand to command handler.');
      const result = await this.saveCommandHandler.Handle(command);

      if (result.isErr()) {
        console.log('[Server] SaveCommand dispatch failed.', {
          reason: result.unwrapErr(),
          durationMs: Date.now() - startedAt,
        });
        res.status(400).json({ ok: false, error: result.unwrapErr() });
        return;
      }

      console.log('[Server] SaveCommand dispatch succeeded.', {
        durationMs: Date.now() - startedAt,
      });
      res.status(202).json({ ok: true, data: result.unwrap() });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unexpected save command HTTP error.';
      console.log('[Server] SaveCommand request failed with exception.', {
        error: message,
        durationMs: Date.now() - startedAt,
      });
      const status =
        message === 'Expected payload with a "rectangles" array.'
          ? 400
          : 500;
      res.status(status).json({ ok: false, error: message });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractRectangles(value: unknown): ReadonlyArray<unknown> {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value) && Array.isArray(value.rectangles)) {
    return value.rectangles;
  }

  throw new Error('Expected payload with a "rectangles" array.');
}

function isJsonParseError(error: unknown): error is SyntaxError & { status: number } {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  const status =
    typeof error === 'object' && error !== null
      ? (error as { status?: unknown }).status
      : undefined;

  return typeof status === 'number' && status === 400;
}

function isInspectMode(): boolean {
  return process.execArgv.some((arg) => arg.startsWith('--inspect'));
}

let runtimeServer: Server | null = null;
let shutdownInProgress = false;

async function bootstrap(): Promise<void> {
  const runtimeConfig = resolveRuntimeConfig();
  runtimeServer = new Server(runtimeConfig.port, runtimeConfig.options);
  await runtimeServer.start();

  if (isInspectMode()) {
    process.stdin.resume();
    console.log('[Server] Debug keep-alive enabled.');
  }
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shutdownInProgress) {
    return;
  }

  shutdownInProgress = true;
  console.log(`[Server] Received ${signal}. Shutting down.`);

  try {
    await runtimeServer?.stop();
  } finally {
    process.exit(0);
  }
}

function registerProcessHooks(): void {
  process.on('unhandledRejection', (reason) => {
    console.log('[Server] unhandledRejection', reason);
  });

  process.on('uncaughtException', (error) => {
    console.log('[Server] uncaughtException', error);
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

function resolveRuntimeConfig(): { port: number; options: ServerOptions } {
  const portFromEnv = Number.parseInt(process.env.PORT ?? '', 10);
  const port =
    Number.isInteger(portFromEnv) && portFromEnv > 0
      ? portFromEnv
      : 3000;

  return {
    port,
    options: {},
  };
}

if (!process.env.VITEST) {
  registerProcessHooks();
  void bootstrap().catch((error: unknown) => {
    console.log('[Server] bootstrap failed', error);
    process.exit(1);
  });
}
