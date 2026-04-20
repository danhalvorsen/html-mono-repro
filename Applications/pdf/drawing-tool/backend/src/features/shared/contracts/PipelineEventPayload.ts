import type { INotificationBase } from '@monorepo/core-design-patterns-cqrs';

export type PipelineScope = 'command' | 'query';

export type PipelineStage =
  | 'pipeline.start'
  | 'pipeline.end'
  | 'validation.ok'
  | 'validation.error'
  | 'performance.start'
  | 'performance.end'
  | 'handler.start'
  | 'handler.end';

export interface PipelineEventPayload<TScope extends PipelineScope> extends INotificationBase {
  readonly scope: TScope;
  readonly stage: PipelineStage;
  readonly ok?: boolean;
  readonly status?: number;
  readonly durationMs?: number;
  readonly message?: string;
  readonly details?: unknown;
  readonly timestamp: string;
}
