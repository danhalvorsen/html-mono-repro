import { IProjectEstimate, IProjectEstimateReport } from "@monorepo/core-math-probability";

export interface IBacklogCounts {
  readonly epicCount: number;
  readonly featureCount: number;
  readonly userStoryCount: number;
  readonly taskCount: number;
}

export interface IBacklogDeterministicSummary {
  readonly optimisticHours: number;
  readonly mostLikelyHours: number;
  readonly pessimisticHours: number;
  readonly pertWeightedHours: number;
}

export interface IBacklogTaskTypeBreakdown {
  readonly taskType: string;
  readonly optimisticHours: number;
  readonly mostLikelyHours: number;
  readonly pessimisticHours: number;
  readonly pertWeightedHours: number;
}

export interface IBacklogAnalysisResult {
  readonly project: IProjectEstimate;
  readonly report: IProjectEstimateReport;
  readonly counts: IBacklogCounts;
  readonly deterministic: IBacklogDeterministicSummary;
  readonly byTaskType: readonly IBacklogTaskTypeBreakdown[];
  readonly markdown: string;
}
