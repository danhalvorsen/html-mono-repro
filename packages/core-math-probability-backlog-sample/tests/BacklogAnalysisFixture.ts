import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  AsymmetricThreePointShapeMapper,
  BacklogJsonProjectAdapter,
  BacklogProbabilityAnalyzer,
  type IBacklogAnalysisResult,
  type IBacklogRootJson,
} from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class BacklogAnalysisFixture {
  public readBacklog(
    relativePath = "./backlog.oscillator-engine-core.json",
  ): IBacklogRootJson {
    const filePath = resolve(__dirname, relativePath);
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
    relativePath = "./backlog.oscillator-engine-core.json",
    iterations = 6_000,
    seed = 20260323,
  ): IBacklogAnalysisResult {
    const backlog = this.readBacklog(relativePath);
    return this.createAnalyzer().analyze(backlog, iterations, seed);
  }
}