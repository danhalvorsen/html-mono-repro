import { Err, Ok, type Result } from '@monorepo/core-design-patterns';
import {
  type INotification,
  type IQuery,
  type IQueryBase,
} from '@monorepo/core-design-patterns-cqrs';
import {
  Mediator,
  Pipeline,
  PipelineContext,
  type IBehavior,
  type IHandler,
  type IMessage,
} from '@monorepo/core-design-patterns-mediator';
import type { DispatchResult } from '../shared/contracts/DispatchResult.js';
import type { PipelineEventPayload } from '../shared/contracts/PipelineEventPayload.js';
import {
  PipelineBehaviorError,
  PipelineBehaviorOk,
} from '../shared/contracts/PipelineBehaviorContracts.js';
import {
  UI_UPDATE_COMMAND,
  UpdateUIBehavoir,
} from '../../infrastructure/cross-cutting-concerns/userInterfaceNotificationBehavoir.js';
import type {
  PipelineHandlerFailure,
  PipelineHandlerResult,
  PipelineHandlerSuccess,
} from '../shared/contracts/PipelineHandlerResult.js';
import { InformationQuery } from './InformationQuery.js';
import { InformationQueryHandler } from './InformationQueryHandler.js';
import type { InformationResultPayload } from './informationResult.js';

export interface InformationQueryApiEnvelope extends IQueryBase {
  readonly type: string;
  readonly payload: unknown;
}

export type DispatchInformationQueryResult = DispatchResult<InformationResultPayload<Record<string, unknown>>>;

export type InformationPipelineEventPayload = PipelineEventPayload<'query'>;

export type InformationPipelineNotification = INotification<InformationPipelineEventPayload>;
export type InformationPipelineNotifier = (notification: InformationPipelineNotification) => void | Promise<void>;

class InformationQueryMessage implements IMessage {
  public readonly name = 'InformationQueryMessage';

  public constructor(
    public readonly queryType: string,
    public readonly queryPayload: unknown,
  ) {}
}

class InformationPipelineContext extends PipelineContext {
  public constructor(
    public readonly queryHandler: InformationQueryHandler<Record<string, unknown>>,
    public readonly notify?: InformationPipelineNotifier,
  ) {
    super();
  }
}

class InformationPipelineError extends PipelineBehaviorError {}

class InformationBehaviorOk extends PipelineBehaviorOk {}

type InformationHandlerSuccess = PipelineHandlerSuccess<InformationResultPayload<Record<string, unknown>>>;

type InformationHandlerFailure = PipelineHandlerFailure;

type InformationHandlerResult = PipelineHandlerResult<InformationResultPayload<Record<string, unknown>>>;

const INFORMATION_QUERY_PAYLOAD = Symbol('information.query.payload');
const INFORMATION_QUERY_START = Symbol('information.query.stopwatch.start');

function notifyUiBehavior(
  notify: InformationPipelineNotifier | undefined,
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

class InformationPerformanceBehavior
  implements IBehavior<InformationQueryMessage, InformationBehaviorOk, InformationPipelineError>
{
  public async execute(
    ctx: InformationPipelineContext,
    _msg: InformationQueryMessage,
  ): Promise<Result<InformationBehaviorOk, InformationPipelineError>> {
    ctx.set(INFORMATION_QUERY_START, Date.now());
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'performance.start',
      details: { message: 'Stopwatch started.' },
    });

    return Ok(new InformationBehaviorOk('query.performance'));
  }
}

class InformationValidationBehavior
  implements IBehavior<InformationQueryMessage, InformationBehaviorOk, InformationPipelineError>
{
  public async execute(
    ctx: InformationPipelineContext,
    msg: InformationQueryMessage,
  ): Promise<Result<InformationBehaviorOk, InformationPipelineError>> {
    const type = msg.queryType.trim().toLowerCase();
    if (type !== 'information') {
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'validation.error',
        status: 404,
        message: 'Only information query is supported.',
      });
      return Err(new InformationPipelineError('query.validation', 404, 'Only information query is supported.'));
    }

    if (!isObject(msg.queryPayload)) {
      await emit(ctx.notify, {
        scope: 'query',
        stage: 'validation.error',
        status: 400,
        message: 'Query payload must be a JSON object.',
      });
      return Err(new InformationPipelineError('query.validation', 400, 'Query payload must be a JSON object.'));
    }

    ctx.set(INFORMATION_QUERY_PAYLOAD, msg.queryPayload);
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'validation.ok',
      ok: true,
      details: { type },
    });
    return Ok(new InformationBehaviorOk('query.validation'));
  }
}

class InformationQueryPipelineHandler implements IHandler<InformationQueryMessage, InformationHandlerResult> {
  public async handle(
    ctx: InformationPipelineContext,
    _msg: InformationQueryMessage,
  ): Promise<InformationHandlerResult> {
    await emit(ctx.notify, {
      scope: 'query',
      stage: 'handler.start',
    });

    const payload = ctx.get<Record<string, unknown>>(INFORMATION_QUERY_PAYLOAD);
    if (!payload) {
      const failure: InformationHandlerFailure = {
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

    const query: IQuery<InformationQuery<Record<string, unknown>>> = {
      json: JSON.stringify(new InformationQuery(payload)),
    };

    const result = await ctx.queryHandler.handle(query);
    if (result.isErr()) {
      const failure: InformationHandlerFailure = {
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

    const success: InformationHandlerSuccess = {
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

const informationPipeline = new Pipeline<
  InformationQueryMessage,
  InformationHandlerResult,
  InformationPipelineError
>(
  [new InformationPerformanceBehavior(), new InformationValidationBehavior()],
  new InformationQueryPipelineHandler(),
);

const informationMediator = new Mediator<
  InformationQueryMessage,
  InformationHandlerResult,
  InformationPipelineError
>(informationPipeline);

export class InformationApiQueryHandler {
  public constructor(
    private readonly queryHandler: InformationQueryHandler<Record<string, unknown>>,
  ) {}

  public async Handle(
    query: IQuery<InformationQueryApiEnvelope>,
    notify?: InformationPipelineNotifier,
  ): Promise<DispatchInformationQueryResult> {
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

    const ctx = new InformationPipelineContext(this.queryHandler, notify);
    await emit(notify, {
      scope: 'query',
      stage: 'pipeline.start',
    });

    const mediatorResult = await informationMediator.send(
      new InformationQueryMessage(parsed.unwrap().type, parsed.unwrap().payload),
      ctx,
    );

    const start = ctx.get<number>(INFORMATION_QUERY_START);
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

export async function dispatchInformationQuery(
  query: IQuery<InformationQueryApiEnvelope>,
  queryHandler: InformationQueryHandler<Record<string, unknown>>,
  notify?: InformationPipelineNotifier,
): Promise<DispatchInformationQueryResult> {
  const apiHandler = new InformationApiQueryHandler(queryHandler);
  return apiHandler.Handle(query, notify);
}

function parseQueryEnvelope(
  query: IQuery<InformationQueryApiEnvelope>,
): Result<{ type: string; payload: unknown }, InformationPipelineError> {
  try {
    const parsed = JSON.parse(query.json) as { type?: unknown; payload?: unknown };
    if (typeof parsed.type !== 'string') {
      return Err(new InformationPipelineError('query.api', 400, 'Query type must be a string.'));
    }

    return Ok({
      type: parsed.type,
      payload: parsed.payload,
    });
  } catch {
    return Err(new InformationPipelineError('query.api', 400, 'Query json is malformed.'));
  }
}

async function emit(
  notify: InformationPipelineNotifier | undefined,
  payload: Omit<InformationPipelineEventPayload, 'timestamp'>,
): Promise<void> {
  const informationPipelineUiBehavior = new UpdateUIBehavoir((command) => {
    notifyUiBehavior(notify, command);
  });

  informationPipelineUiBehavior.send({
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
      type: 'InformationPipeline.Notification',
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
