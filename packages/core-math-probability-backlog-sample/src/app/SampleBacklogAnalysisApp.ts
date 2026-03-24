// src/app/SampleBacklogAnalysisApp.ts

import type { IBacklogRootJson } from "../json/IBacklogRootJson.js";
import type { IBacklogAnalysisResult } from "../BacklogAnalysisResult.js";

export interface ISampleBacklogAnalysisApp {
  run(
    backlog: IBacklogRootJson,
    iterations?: number,
    seed?: number,
  ): IBacklogAnalysisResult;
}