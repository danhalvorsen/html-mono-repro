// ============================================================================
// src/Pipeline/DragPipelineResult.ts
// ============================================================================

import type { IBehaviorResult } from "@monorepo/core-design-patterns-mediator";

export class DragPipelineResult implements IBehaviorResult {
  public readonly behavior: string;
  public readonly ok: boolean;
  public readonly reason?: string;

  private constructor(
    behavior: string,
    ok: boolean,
    reason?: string,
  ) {
    this.behavior = behavior;
    this.ok = ok;
    this.reason = reason;
  }

  public static ok(behavior: string): DragPipelineResult {
    return new DragPipelineResult(behavior, true);
  }

  public static fail(
    behavior: string,
    reason: string,
  ): DragPipelineResult {
    return new DragPipelineResult(behavior, false, reason);
  }
}