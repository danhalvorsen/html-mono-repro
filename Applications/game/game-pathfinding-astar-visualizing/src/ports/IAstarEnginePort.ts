import type {
  AstarSettings,
  GridSnapshot,
} from "../contracts/AstarVisualizerContracts.js";
import type { IAstarStepRunner } from "./IAstarStepRunner.js";

export interface IAstarEnginePort extends IAstarStepRunner {
  configure(settings: AstarSettings): void;
  reset(snapshot: GridSnapshot): void;
}
