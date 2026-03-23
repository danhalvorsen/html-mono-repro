
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AsymmetricThreePointShapeMapper,
  BacklogJsonProjectAdapter,
  BacklogProbabilityAnalyzer,
  type IBacklogAnalysisResult,
  type IBacklogRootJson,
} from "../src/index.js";

export class BacklogAnalysisFixture {
  public readBacklog(
    relativePath = "./tests/fixtures/backlog.oscillator-engine-core.json",
  ): IBacklogRootJson {
    const filePath = resolve(process.cwd(), relativePath);
    const content = readFileSync(filePath, "utf8");
    return JSON.parse(content) as IBacklogRootJson;
  }

  public createAnalyzer(): BacklogProbabilityAnalyzer {
    return new BacklogProbabilityAnalyzer(
      new BacklogJsonProjectAdapter(
        new AsymmetricThreePointShapeMapper(),
      ),
    );
  }

  public analyze(
    relativePath = "./tests/fixtures/backlog.oscillator-engine-core.json",
    iterations = 6_000,
    seed = 20260323,
  ): IBacklogAnalysisResult {
    const backlog = this.readBacklog(relativePath);
    return this.createAnalyzer().analyze(backlog, iterations, seed);
  }
}
