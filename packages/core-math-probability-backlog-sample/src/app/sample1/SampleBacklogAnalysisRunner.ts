import type { IBacklogRootJson } from "../../json/IBacklogRootJson.js";
import type { IBacklogAnalysisResult } from "../../BacklogAnalysisResult.js";
import type { ISampleBacklogAnalysisApp } from "./SampleBacklogAnalysisApp.js";

import { AsymmetricThreePointShapeMapper } from "../../AsymmetricThreePointShapeMapper.js";
import { BacklogJsonProjectAdapter } from "../../BacklogJsonProjectAdapter.js";
import { BacklogProbabilityAnalyzer } from "../../BacklogProbabilityAnalyzer.js";

export class SampleBacklogAnalysisRunner implements ISampleBacklogAnalysisApp {
  private readonly analyzer: BacklogProbabilityAnalyzer;

  public constructor() {
    this.analyzer = new BacklogProbabilityAnalyzer(
      new BacklogJsonProjectAdapter(
        new AsymmetricThreePointShapeMapper(),
      ),
    );
  }

  public run(
    backlog: IBacklogRootJson,
    iterations = 6_000,
    seed = 20260323,
  ): IBacklogAnalysisResult {
    return this.analyzer.analyze(backlog, iterations, seed);
  }
}