import type { AstarStepEvent } from "./contracts/AstarContracts.js";

export interface VisualizerStepEvent {
  readonly kind: string;
  readonly coordinate: { row: number; col: number } | null;
  readonly path: ReadonlyArray<{ row: number; col: number }> | null;
}

export function createVisualizerStepAdapter() {
  return {
    adapt(step: AstarStepEvent): VisualizerStepEvent {
      return {
        kind: step.kind,
        coordinate: step.coordinate,
        path: step.path,
      };
    },
  };
}
