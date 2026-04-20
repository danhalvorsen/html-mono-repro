import type { IBehaviorResult } from '@monorepo/core-design-patterns-mediator';

export class PipelineBehaviorError implements IBehaviorResult {
  public constructor(
    public readonly behavior: string,
    public readonly status: number,
    public readonly reason: string,
  ) {}
}

export class PipelineBehaviorOk implements IBehaviorResult {
  public constructor(public readonly behavior: string) {}
}
