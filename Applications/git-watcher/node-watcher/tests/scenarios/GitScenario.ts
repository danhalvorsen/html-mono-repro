import type { GitRepo } from "../fixtures/GitRepo.js";

export interface GitScenarioStep {
  execute(repo: GitRepo): Promise<void>;
}

export class GitScenario {
  public constructor(
    public readonly name: string,
    private readonly steps: readonly GitScenarioStep[],
  ) {}

  public async execute(repo: GitRepo): Promise<void> {
    for (const step of this.steps) {
      await step.execute(repo);
    }
  }
}
