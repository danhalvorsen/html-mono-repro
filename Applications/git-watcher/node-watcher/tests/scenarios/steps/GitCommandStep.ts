import type { GitRepo } from "../../fixtures/GitRepo.js";
import type { GitScenarioStep } from "../GitScenario.js";

export class GitCommandStep implements GitScenarioStep {
  public constructor(private readonly args: readonly string[]) {
    if (args.length === 0) {
      throw new Error("GitCommandStep requires at least one argument.");
    }
  }

  public async execute(repo: GitRepo): Promise<void> {
    repo.run(...this.args);
  }
}
