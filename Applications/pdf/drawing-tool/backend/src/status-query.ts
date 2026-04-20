import { Err, Ok, type Result } from '@monorepo/core-design-patterns';
import { CoreFileSystemModule, Path } from '@monorepo/core-filesystem';
import {
  QueryHandler,
  type INotification,
  type INotificationBase,
  type IQuery,
  type IQueryBase,
} from '@monorepo/core-design-patterns-cqrs';
import {
  Mediator,
  Pipeline,
  PipelineContext,
  type IBehavior,
  type IBehaviorResult,
  type IHandler,
  type IMessage,
} from '@monorepo/core-design-patterns-mediator';
import {
  UI_UPDATE_COMMAND,
  UpdateUIBehavoir,
} from './infrastructure/cross-cutting-concerns/userInterfaceNotificationBehavoir.js';

export interface StatusQueryApiEnvelope extends IQueryBase {
  readonly type: string;
  readonly payload: unknown;
}

export class StatusQuery implements IQueryBase {
  public constructor(public readonly includeFiles: boolean = true) {}
}

export interface StatusQuerySuccess {
  readonly status: 'ok';
  readonly savedFiles: number;
}

export interface DispatchStatusQueryResult {
  readonly status: number;
  readonly body:
    | { ok: true; data: StatusQuerySuccess }
    | { ok: false; error: string };
}

export interface QueryPipelineEventPayload extends INotificationBase {
  readonly scope: 'query';
  readonly stage:
    | 'pipeline.start'
    | 'pipeline.end'
    | 'validation.ok'
    | 'validation.error'
    | 'performance.start'
    | 'performance.end'
    | 'handler.start'
    | 'handler.end';
  readonly ok?: boolean;
  readonly status?: number;
  readonly durationMs?: number;
  readonly message?: string;
  readonly details?: unknown;
  readonly timestamp: string;
}

export type QueryPipelineNotification = INotification<QueryPipelineEventPayload>;
export type QueryPipelineNotifier = (notification: QueryPipelineNotification) => void | Promise<void>;

export class StatusQueryHandler extends QueryHandler<StatusQuery, StatusQuerySuccess, string> {
  public constructor(
    private readonly saveDirectory: string,
    private readonly fileSystem: CoreFileSystemModule = new CoreFileSystemModule(),
  ) {
    super();
  }

  public override async handle(query: IQuery<StatusQuery>): Promise<Result<StatusQuerySuccess, string>> {
    try {
      const parsed = JSON.parse(query.json) as Partial<StatusQuery>;
      const includeFiles = parsed.includeFiles !== false;

      if (!includeFiles) {
        return Ok({ status: 'ok', savedFiles: 0 });
      }

      const directory = this.fileSystem.createDirectory(Path.from(this.saveDirectory));
      directory.create(true);
      const files = directory.listFiles();
      return Ok({ status: 'ok', savedFiles: files.length });
    } catch (error) {
      return Err(error instanceof Error ? error.message : 'Unexpected status error');
    }
  }
}

class StatusQueryMessage implements IMessage {
  public readonly name = 'StatusQueryMessage';

  public constructor(
    public readonly queryType: string,
    public readonly queryPayload: unknown,
  ) {}
}

class StatusQueryPipelineContext extends PipelineContext {
  public constructor(
    public readonly cqrsHandler: StatusQueryHandler,
    public readonly notify?: QueryPipelineNotifier,
  ) {
    super();
  }
}

class StatusQueryPipelineError implements IBehaviorResult {
  public constructor(
    public readonly behavior: string,
    public readonly status: number,
    public readonly reason: string,
  ) {}
}

class QueryBehaviorOk implements IBehaviorResult {
  public constructor(public readonly behavior: string) {}
}

interface QueryHandlerSuccess {
  readonly ok: true;
  readonly data: StatusQuerySuccess;
}

interface QueryHandlerFailure {
  readonly ok: false;
  readonly status: number;
  readonly error: string;
}

type QueryHandlerResult = QueryHandlerSuccess | QueryHandlerFailure;

const STATUS_QUERY_PAYLOAD = Symbol('status.query.payload');
const STATUS_QUERY_START = Symbol('status.query.stopwatch.start');

function notifyUiBehavior(
  notify: QueryPipelineNotifier | undefined,
  command: {
    readonly name: string;
    readonly scope: 'http' | 'command' | 'query';
    readonly stage: string;
    readonly details?: unknown;
  },
): void {
  if (!notify) {
    return;
  }

  void notify({
    json: JSON.stringify({
      type: 'UiBehavior.Notification',
      payload: {
        scope: command.scope,
        stage: command.stage,
        details: command.details,
        timestamp: new Date().toISOString(),
      },
    }),
  });
}

class StatusPerformanceBehavior
  implements IBehavior<StatusQueryMessage, QueryBehaviorOk, StatusQueryPipelineError>
{
  public async execute(
    ctx: StatusQueryPipelineContext,
    _msg: StatusQueryMessage,
  ): Promise<Result<QueryBehaviorOk, StatusQueryPipelineError>> {
    ctx.set(STATUS_QUERY_START, Date.now());
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'performance.start',
      details: { message: 'Stopwatch started.' },
    });

    return Ok(new QueryBehaviorOk('query.performance'));
  }
}

class StatusValidationBehavior
  implements IBehavior<StatusQueryMessage, QueryBehaviorOk, StatusQueryPipelineError>
{
  public async execute(
    ctx: StatusQueryPipelineContext,
    msg: StatusQueryMessage,
  ): Promise<Result<QueryBehaviorOk, StatusQueryPipelineError>> {
    const type = msg.queryType.trim().toLowerCase();
    if (type !== 'status') {
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'validation.error',
        status: 404,
        message: 'Only status query is supported.',
      });
      return Err(new StatusQueryPipelineError('query.validation', 404, 'Only status query is supported.'));
    }

    if (msg.queryPayload !== undefined && !isObject(msg.queryPayload)) {
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'validation.error',
        status: 400,
        message: 'Query payload must be a JSON object.',
      });
      return Err(new StatusQueryPipelineError('query.validation', 400, 'Query payload must be a JSON object.'));
    }

    const payload = isObject(msg.queryPayload) ? msg.queryPayload : {};
    if ('includeFiles' in payload && typeof payload.includeFiles !== 'boolean') {
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'validation.error',
        status: 400,
        message: 'includeFiles must be boolean when provided.',
      });
      return Err(new StatusQueryPipelineError('query.validation', 400, 'includeFiles must be boolean when provided.'));
    }

    ctx.set(STATUS_QUERY_PAYLOAD, {
      includeFiles: payload.includeFiles !== false,
    });
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'validation.ok',
      ok: true,
      details: { type },
    });

    return Ok(new QueryBehaviorOk('query.validation'));
  }
}

class StatusPipelineHandler implements IHandler<StatusQueryMessage, QueryHandlerResult> {
  public async handle(
    ctx: StatusQueryPipelineContext,
    _msg: StatusQueryMessage,
  ): Promise<QueryHandlerResult> {
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'handler.start',
    });

    const payload = ctx.get<{ includeFiles: boolean }>(STATUS_QUERY_PAYLOAD);
    if (!payload) {
      const failure: QueryHandlerFailure = {
        ok: false,
        status: 500,
        error: 'Query payload not initialized.',
      };
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'handler.end',
        ok: false,
        status: failure.status,
        message: failure.error,
      });
      return failure;
    }

    const query: IQuery<StatusQuery> = {
      json: JSON.stringify(new StatusQuery(payload.includeFiles)),
    };

    const result = await ctx.cqrsHandler.handle(query);
    if (result.isErr()) {
      const failure: QueryHandlerFailure = {
        ok: false,
        status: 400,
        error: result.unwrapErr(),
      };
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'handler.end',
        ok: false,
        status: failure.status,
        message: failure.error,
      });
      return failure;
    }

    const success: QueryHandlerSuccess = {
      ok: true,
      data: result.unwrap(),
    };
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'handler.end',
      ok: true,
      status: 200,
      details: success.data,
    });
    return success;
  }
}

const statusPipeline = new Pipeline<
  StatusQueryMessage,
  QueryHandlerResult,
  StatusQueryPipelineError
>([new StatusPerformanceBehavior(), new StatusValidationBehavior()], new StatusPipelineHandler());

const statusMediator = new Mediator<
  StatusQueryMessage,
  QueryHandlerResult,
  StatusQueryPipelineError
>(statusPipeline);

export class StatusApiQueryHandler {
  public constructor(private readonly cqrsHandler: StatusQueryHandler) {}

  public async Handle(
    query: IQuery<StatusQueryApiEnvelope>,
    notify?: QueryPipelineNotifier,
  ): Promise<DispatchStatusQueryResult> {
    const parsed = parseQueryEnvelope(query);
    if (parsed.isErr()) {
      const error = parsed.unwrapErr();
      await emit(notify, {
        scope: 'query',
        stage: 'pipeline.end',
        ok: false,
        status: error.status,
        message: error.reason,
      });
      return {
        status: error.status,
        body: { ok: false, error: error.reason },
      };
    }

    const ctx = new StatusQueryPipelineContext(this.cqrsHandler, notify);
    await emit(notify, {
      scope: 'query',
      stage: 'pipeline.start',
    });

    const mediatorResult = await statusMediator.send(
      new StatusQueryMessage(parsed.unwrap().type, parsed.unwrap().payload),
      ctx,
    );

    const start = ctx.get<number>(STATUS_QUERY_START);
    if (typeof start === 'number') {
      await emit(notify, {
        scope: 'query',
        stage: 'performance.end',
        durationMs: Date.now() - start,
        ok: mediatorResult.isOk(),
        details: { message: 'Stopwatch stopped.' },
      });
    }

    if (mediatorResult.isErr()) {
      const error = mediatorResult.unwrapErr();
      await emit(notify, {
        scope: 'query',
        stage: 'pipeline.end',
        ok: false,
        status: error.status,
        message: error.reason,
      });
      return {
        status: error.status,
        body: { ok: false, error: error.reason },
      };
    }

    const outcome = mediatorResult.unwrap();
    if (!outcome.ok) {
      await emit(notify, {
        scope: 'query',
        stage: 'pipeline.end',
        ok: false,
        status: outcome.status,
        message: outcome.error,
      });
      return {
        status: outcome.status,
        body: { ok: false, error: outcome.error },
      };
    }

    await emit(notify, {
      scope: 'query',
      stage: 'pipeline.end',
      ok: true,
      status: 200,
    });
    return {
      status: 200,
      body: { ok: true, data: outcome.data },
    };
  }
}

export async function dispatchStatusQuery(
  query: IQuery<StatusQueryApiEnvelope>,
  handler: StatusQueryHandler,
  notify?: QueryPipelineNotifier,
): Promise<DispatchStatusQueryResult> {
  const apiHandler = new StatusApiQueryHandler(handler);
  return apiHandler.Handle(query, notify);
}

function parseQueryEnvelope(
  query: IQuery<StatusQueryApiEnvelope>,
): Result<{ type: string; payload: unknown }, StatusQueryPipelineError> {
  try {
    const parsed = JSON.parse(query.json) as { type?: unknown; payload?: unknown };
    if (typeof parsed.type !== 'string') {
      return Err(new StatusQueryPipelineError('query.api', 400, 'Query type must be a string.'));
    }

    return Ok({
      type: parsed.type,
      payload: parsed.payload,
    });
  } catch {
    return Err(new StatusQueryPipelineError('query.api', 400, 'Query json is malformed.'));
  }
}

async function emit(
  notify: QueryPipelineNotifier | undefined,
  payload: Omit<QueryPipelineEventPayload, 'timestamp'>,
): Promise<void> {
  const statusPipelineUiBehavior = new UpdateUIBehavoir((command) => {
    notifyUiBehavior(notify, command);
  });

  statusPipelineUiBehavior.send({
    name: UI_UPDATE_COMMAND.PipelineStageObserved,
    scope: payload.scope,
    stage: payload.stage,
    details: payload,
  });

  if (!notify) {
    return;
  }

  await notify({
    json: JSON.stringify({
      type: 'QueryPipeline.Notification',
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    }),
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
