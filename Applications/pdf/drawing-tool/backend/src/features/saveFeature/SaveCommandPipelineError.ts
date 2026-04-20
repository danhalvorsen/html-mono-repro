import { PipelineBehaviorError } from "../shared/contracts/PipelineBehaviorContracts.js";

export class SaveCommandPipelineError extends PipelineBehaviorError {
  public constructor(
    behavior: string,
    status: number,
    reason: string,
  ) {
    super(behavior, status, reason);
  }
}