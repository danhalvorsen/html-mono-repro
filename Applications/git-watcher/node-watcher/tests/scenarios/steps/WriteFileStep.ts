import type { GitRepo } from "../../fixtures/GitRepo.js";
import type { GitScenarioStep } from "../GitScenario.js";

export class WriteFileStep implements GitScenarioStep {
  public constructor(
    private readonly relativePath: string,
    private readonly content: string | Uint8Array,
  ) {}

  public async execute(repo: GitRepo): Promise<void> {
    await repo.writeFile(this.relativePath, this.content);
  }
}
