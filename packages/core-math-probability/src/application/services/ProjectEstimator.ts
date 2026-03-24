// =====================================================================================
// FILE: src/application/services/ProjectEstimator.ts
// PURPOSE:
// - Fix incorrect upper-level aggregation
// - Preserve true Monte Carlo samples through task → story → feature → project
// - Stop reconstructing pseudo-samples from summary statistics
// =====================================================================================

import { IProjectEstimator } from "../../domain/contracts/IProjectEstimator.js";
import { IEstimateReportBuilder } from "../../domain/reports/IEstimateReportBuilder.js";
import { IFeatureEstimateReport } from "../../domain/reports/IFeatureEstimateReport.js";
import { IProjectEstimateReport } from "../../domain/reports/IProjectEstimateReport.js";
import { ITaskEstimateReport } from "../../domain/reports/ITaskEstimateReport.js";
import { IUserStoryEstimateReport } from "../../domain/reports/IUserStoryEstimateReport.js";
import {
  IEstimateDistributionFactory,
  IFeatureEstimate,
  IProjectEstimate,
  IRandomSource,
  IUserStoryEstimate,
  Sample,
} from "../../domain/value-objects/Probability.js";
import { TriangularDistribution } from "../../infrastructure/distributions/TriangularDistribution.js";

interface ITaskSimulation {
  readonly report: ITaskEstimateReport;
  readonly sample: Sample;
}

interface IUserStorySimulation {
  readonly report: IUserStoryEstimateReport;
  readonly sample: Sample;
}

interface IFeatureSimulation {
  readonly report: IFeatureEstimateReport;
  readonly sample: Sample;
}

export class ProjectEstimator implements IProjectEstimator {
  public constructor(
    private readonly distributionFactory: IEstimateDistributionFactory,
    private readonly reportBuilder: IEstimateReportBuilder,
  ) {}

  public estimate(
    project: IProjectEstimate,
    iterations: number,
    random: IRandomSource,
  ): IProjectEstimateReport {
    this.ensurePositiveIterations(iterations);

    const featureSimulations: IFeatureSimulation[] = project.features.map((feature) =>
      this.estimateFeature(feature, iterations, random),
    );

    const projectSample = this.aggregateSamples(
      featureSimulations.map((feature) => feature.sample),
    );

    return {
      id: project.id,
      name: project.name,
      estimate: this.reportBuilder.build(
        this.createSummaryDistribution(projectSample),
        projectSample,
      ),
      features: featureSimulations.map((feature) => feature.report),
    };
  }

  private estimateFeature(
    feature: IFeatureEstimate,
    iterations: number,
    random: IRandomSource,
  ): IFeatureSimulation {
    const storySimulations: IUserStorySimulation[] = feature.stories.map((story) =>
      this.estimateStory(story, iterations, random),
    );

    const featureSample = this.aggregateSamples(
      storySimulations.map((story) => story.sample),
    );

    return {
      sample: featureSample,
      report: {
        id: feature.id,
        name: feature.name,
        estimate: this.reportBuilder.build(
          this.createSummaryDistribution(featureSample),
          featureSample,
        ),
        stories: storySimulations.map((story) => story.report),
      },
    };
  }

  private estimateStory(
    story: IUserStoryEstimate,
    iterations: number,
    random: IRandomSource,
  ): IUserStorySimulation {
    const taskSimulations: ITaskSimulation[] = story.tasks.map((task) => {
      const distribution = this.distributionFactory.create({
        range: task.range,
        shape: task.shape,
        kind: task.distributionKind,
      });

      const taskValues: number[] = new Array<number>(iterations);

      for (let index = 0; index < iterations; index += 1) {
        taskValues[index] = distribution.sample(random);
      }

      const taskSample = new Sample(taskValues);

      return {
        sample: taskSample,
        report: {
          id: task.id,
          name: task.name,
          estimate: this.reportBuilder.build(distribution, taskSample),
        },
      };
    });

    const storySample = this.aggregateSamples(
      taskSimulations.map((task) => task.sample),
    );

    return {
      sample: storySample,
      report: {
        id: story.id,
        name: story.name,
        estimate: this.reportBuilder.build(
          this.createSummaryDistribution(storySample),
          storySample,
        ),
        tasks: taskSimulations.map((task) => task.report),
      },
    };
  }

  private aggregateSamples(samples: readonly Sample[]): Sample {
  if (samples.length === 0) {
    throw new RangeError("At least one sample is required for aggregation.");
  }

  const first = samples[0]!; // safe after guard
  const iterationCount = first.values.length;

  for (const sample of samples) {
    if (sample.values.length !== iterationCount) {
      throw new RangeError("All aggregated samples must have identical iteration counts.");
    }
  }

  const aggregatedValues = new Array<number>(iterationCount);

  for (let iteration = 0; iteration < iterationCount; iteration += 1) {
    let total = 0;

    for (const sample of samples) {
      total += sample.values[iteration]!; // safe due to same length guarantee
    }

    aggregatedValues[iteration] = total;
  }

  return new Sample(aggregatedValues);
}

  private createSummaryDistribution(sample: Sample): TriangularDistribution {
    const minimum = Math.min(...sample.values);
    const maximum = Math.max(...sample.values);
    const median = this.computeMedian(sample);

    return new TriangularDistribution(minimum, median, maximum);
  }

  private computeMedian(sample: Sample): number {
    const sorted = [...sample.values].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1]! + sorted[middle]!) / 2;
    }

    return sorted[middle]!;
  }

  private ensurePositiveIterations(iterations: number): void {
    if (!Number.isInteger(iterations) || iterations <= 0) {
      throw new RangeError("iterations must be a positive integer.");
    }
  }
}