import type { ReactiveController, ReactiveControllerHost } from "lit";
import type {
  AstarEngineStepEvent,
  AstarStats,
  AstarStatus,
} from "../contracts/AstarVisualizerContracts.js";

export interface IAstarStatsCalculator {
  calculate(step: AstarEngineStepEvent, current: AstarStats): AstarStats;
}

export class AstarStatsController
  implements IAstarStatsCalculator, ReactiveController
{
  hostConnected?(): void {}
  hostDisconnected?(): void {}

  public constructor(host?: ReactiveControllerHost) {
    host?.addController(this);
  }

  public calculate(step: AstarEngineStepEvent, current: AstarStats): AstarStats {
    return {
      evaluatedNodes: step.evaluatedNodes,
      openSize: step.openSize,
      closedSize: step.closedSize,
      pathLength: this.calculatePathLength(step, current),
      elapsedMs: step.elapsedMs,
      status: this.calculateStatus(step),
    };
  }

  private calculatePathLength(
    step: AstarEngineStepEvent,
    current: AstarStats,
  ): number | null {
    if (step.kind === "path-found") {
      return step.path?.length ?? 0;
    }

    if (step.kind === "no-path") {
      return null;
    }

    return current.pathLength;
  }

  private calculateStatus(step: AstarEngineStepEvent): AstarStatus {
    if (step.kind === "path-found") {
      return "completed";
    }

    if (step.kind === "no-path") {
      return "failed";
    }

    return "running";
  }
}
