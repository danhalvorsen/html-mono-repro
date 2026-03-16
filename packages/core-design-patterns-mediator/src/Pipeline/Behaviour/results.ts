import type { IBehaviorResult } from "./IBehaviorResult.js";

/* ============================================================================
 * Behavior Result Value Objects
 * ============================================================================ */

export abstract class BehaviorResultBase implements IBehaviorResult {
  public abstract readonly behavior: string;
}

export class ValidationOk extends BehaviorResultBase {
  public readonly behavior = "validation";
}

export class ValidationErr extends BehaviorResultBase {
  public readonly behavior = "validation";

  public constructor(public readonly reason: string) {
    super();
  }
}

export class PerformanceOk extends BehaviorResultBase {
  public readonly behavior = "performance";

  public constructor(public readonly ms: number) {
    super();
  }
}

export class PerformanceErr extends BehaviorResultBase {
  public readonly behavior = "performance";

  public constructor(
    public readonly reason: string,
    public readonly ms: number = 0,
  ) {
    super();
  }
}
