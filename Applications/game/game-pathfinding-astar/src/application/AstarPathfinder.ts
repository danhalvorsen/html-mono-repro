import type {
  AstarSearchRequest,
  AstarSearchResult,
  IAstarPathfinder,
} from "../contracts/AstarContracts.js";
import { createStepper } from "./AstarStepper.js";

export class AstarPathfinder implements IAstarPathfinder {
  public findPath(request: AstarSearchRequest): AstarSearchResult {
    const stepper = createStepper(request);
    return stepper.runToCompletion();
  }
}
