import { IProjectEstimateReport, Mulberry32RandomSource, ProbabilityEstimationCompositionRoot } from "@monorepo/core.math.probability";
import { IBacklogAnalysisResult, IBacklogCounts, IBacklogDeterministicSummary, IBacklogTaskTypeBreakdown } from "./BacklogAnalysisResult.js";
import { BacklogJsonProjectAdapter } from "./BacklogJsonProjectAdapter.js";
import { IBacklogRootJson } from "./json/IBacklogRootJson.js";
import { IBacklogEpicJson } from "./json/IBacklogEpicJson.js";
import { IBacklogTaskJson } from "./json/IBacklogTaskJson.js";

interface ITaskTypeAccumulator {
  optimisticHours: number;
  mostLikelyHours: number;
  pessimisticHours: number;
  pertWeightedHours: number;
}

export class BacklogProbabilityAnalyzer {
  public constructor(
    private readonly adapter: BacklogJsonProjectAdapter,
  ) {}

  public analyze(
    backlog: IBacklogRootJson,
    iterations = 10_000,
    seed = 20260323,
  ): IBacklogAnalysisResult {
    if (!Number.isInteger(iterations) || iterations <= 0) {
      throw new RangeError("iterations must be a positive integer.");
    }

    const project = this.adapter.map(backlog);
    const estimator = ProbabilityEstimationCompositionRoot.createProjectEstimator();
    const report = estimator.estimate(
      project,
      iterations,
      new Mulberry32RandomSource(seed),
    );

    const counts = this.buildCounts(backlog);
    const deterministic = this.buildDeterministicSummary(backlog);
    const byTaskType = this.buildTaskTypeBreakdown(backlog);
    const markdown = this.renderMarkdown(report, counts, deterministic, byTaskType);

    return {
      project,
      report,
      counts,
      deterministic,
      byTaskType,
      markdown,
    };
  }

  private buildCounts(backlog: IBacklogRootJson): IBacklogCounts {
    let featureCount = 0;
    let userStoryCount = 0;
    let taskCount = 0;

    for (const epic of backlog.epics) {
      for (const feature of epic.features) {
        featureCount += 1;

        for (const story of feature.userStories) {
          userStoryCount += 1;
          taskCount += story.tasks.length;
        }
      }
    }

    return {
      epicCount: backlog.epics.length,
      featureCount,
      userStoryCount,
      taskCount,
    };
  }

  private buildDeterministicSummary(backlog: IBacklogRootJson): IBacklogDeterministicSummary {
    const tasks = this.flattenTasks(backlog);

    let optimisticHours = 0;
    let mostLikelyHours = 0;
    let pessimisticHours = 0;
    let pertWeightedHours = 0;

    for (const task of tasks) {
      optimisticHours += task.estimate.optimistic;
      mostLikelyHours += task.estimate.mostLikely;
      pessimisticHours += task.estimate.pessimistic;
      pertWeightedHours += this.calculatePertWeightedHours(task);
    }

    return {
      optimisticHours,
      mostLikelyHours,
      pessimisticHours,
      pertWeightedHours,
    };
  }

  private buildTaskTypeBreakdown(backlog: IBacklogRootJson): readonly IBacklogTaskTypeBreakdown[] {
    const accumulators = new Map<string, ITaskTypeAccumulator>();

    for (const task of this.flattenTasks(backlog)) {
      const current = accumulators.get(task.type) ?? {
        optimisticHours: 0,
        mostLikelyHours: 0,
        pessimisticHours: 0,
        pertWeightedHours: 0,
      };

      current.optimisticHours += task.estimate.optimistic;
      current.mostLikelyHours += task.estimate.mostLikely;
      current.pessimisticHours += task.estimate.pessimistic;
      current.pertWeightedHours += this.calculatePertWeightedHours(task);

      accumulators.set(task.type, current);
    }

    return [...accumulators.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([taskType, value]) => ({
        taskType,
        optimisticHours: value.optimisticHours,
        mostLikelyHours: value.mostLikelyHours,
        pessimisticHours: value.pessimisticHours,
        pertWeightedHours: value.pertWeightedHours,
      }));
  }

  private flattenTasks(backlog: IBacklogRootJson): readonly IBacklogTaskJson[] {
    return backlog.epics
      .flatMap((epic: IBacklogEpicJson) => epic.features)
      .flatMap((feature) => feature.userStories)
      .flatMap((story) => story.tasks);
  }

  private calculatePertWeightedHours(task: IBacklogTaskJson): number {
    return (
      task.estimate.optimistic +
      4 * task.estimate.mostLikely +
      task.estimate.pessimistic
    ) / 6;
  }

  private renderMarkdown(
    report: IProjectEstimateReport,
    counts: IBacklogCounts,
    deterministic: IBacklogDeterministicSummary,
    byTaskType: readonly IBacklogTaskTypeBreakdown[],
  ): string {
    const lines: string[] = [];

    lines.push("# Backlog probability analysis");
    lines.push("");
    lines.push("## Scope");
    lines.push(`- Epics: ${counts.epicCount}`);
    lines.push(`- Features: ${counts.featureCount}`);
    lines.push(`- User stories: ${counts.userStoryCount}`);
    lines.push(`- Tasks: ${counts.taskCount}`);
    lines.push("");
    lines.push("## Deterministic baseline");
    lines.push(`- Optimistic hours: ${deterministic.optimisticHours.toFixed(2)}`);
    lines.push(`- Most likely hours: ${deterministic.mostLikelyHours.toFixed(2)}`);
    lines.push(`- Pessimistic hours: ${deterministic.pessimisticHours.toFixed(2)}`);
    lines.push(`- PERT weighted hours: ${deterministic.pertWeightedHours.toFixed(2)}`);
    lines.push("");
    lines.push("## Monte Carlo project estimate");
    lines.push(`- Mean hours: ${report.estimate.statistics.mean.toFixed(2)}`);
    lines.push(`- StdDev hours: ${report.estimate.statistics.standardDeviation.toFixed(2)}`);
    lines.push(`- P50 hours: ${report.estimate.statistics.percentile50.toFixed(2)}`);
    lines.push(`- P80 hours: ${report.estimate.statistics.percentile80.toFixed(2)}`);
    lines.push(`- P90 hours: ${report.estimate.statistics.percentile90.toFixed(2)}`);
    lines.push(`- P95 hours: ${report.estimate.statistics.percentile95.toFixed(2)}`);
    lines.push(`- Sample min hours: ${report.estimate.statistics.minimum.toFixed(2)}`);
    lines.push(`- Sample max hours: ${report.estimate.statistics.maximum.toFixed(2)}`);
    lines.push("");
    lines.push("## Breakdown by task type");

    for (const item of byTaskType) {
      lines.push(
        `- ${item.taskType}: optimistic=${item.optimisticHours.toFixed(2)}, mostLikely=${item.mostLikelyHours.toFixed(2)}, pessimistic=${item.pessimisticHours.toFixed(2)}, pert=${item.pertWeightedHours.toFixed(2)}`,
      );
    }

    return lines.join("\n");
  }
}
