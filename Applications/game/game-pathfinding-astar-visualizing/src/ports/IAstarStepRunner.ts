import type { AstarEngineStepEvent } from "../contracts/AstarVisualizerContracts.js";

export interface IAstarStepRunner {
  next(): AstarEngineStepEvent | null;
}
