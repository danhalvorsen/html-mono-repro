 
// =====================================================================================
// APPLICATION — PROJECT ESTIMATOR
// =====================================================================================

import { IProjectEstimator } from "../../domain/contracts/IProjectEstimator.js";
import { IEstimateReportBuilder } from "../../domain/reports/IEstimateReportBuilder.js";
import { IEstimateStatistics } from "../../domain/reports/IEstimateStatistics.js";
import { IFeatureEstimateReport } from "../../domain/reports/IFeatureEstimateReport.js";
import { IProjectEstimateReport } from "../../domain/reports/IProjectEstimateReport.js";
import { ITaskEstimateReport } from "../../domain/reports/ITaskEstimateReport.js";
import { IUserStoryEstimateReport } from "../../domain/reports/IUserStoryEstimateReport.js";
import { IEstimateDistributionFactory, IProjectEstimate, IRandomSource, IFeatureEstimate, IUserStoryEstimate, Sample } from "../../domain/value-objects/Probability.js";
import { TriangularDistribution } from "../../infrastructure/distributions/TriangularDistribution.js";

export class ProjectEstimator implements IProjectEstimator {
    public constructor(
        private readonly distributionFactory: IEstimateDistributionFactory,
        private readonly reportBuilder: IEstimateReportBuilder
    ) { }

    public estimate(
        project: IProjectEstimate,
        iterations: number,
        random: IRandomSource
    ): IProjectEstimateReport {
        if (!Number.isInteger(iterations) || iterations <= 0) {
            throw new RangeError("iterations must be a positive integer.");
        }

        const featureReports: IFeatureEstimateReport[] = [];

        for (const feature of project.features) {
            featureReports.push(this.estimateFeature(feature, iterations, random));
        }

        const totalProjectSample = this.aggregateFeatureReports(featureReports);
        const projectDistribution = new TriangularDistribution(
            Math.min(...totalProjectSample.values),
            this.computeMedian(totalProjectSample),
            Math.max(...totalProjectSample.values)
        );

        return {
            id: project.id,
            name: project.name,
            estimate: this.reportBuilder.build(projectDistribution, totalProjectSample),
            features: featureReports,
        };
    }

    private estimateFeature(
        feature: IFeatureEstimate,
        iterations: number,
        random: IRandomSource
    ): IFeatureEstimateReport {
        const storyReports: IUserStoryEstimateReport[] = [];

        for (const story of feature.stories) {
            storyReports.push(this.estimateStory(story, iterations, random));
        }

        const featureSample = this.aggregateStoryReports(storyReports);
        const featureDistribution = new TriangularDistribution(
            Math.min(...featureSample.values),
            this.computeMedian(featureSample),
            Math.max(...featureSample.values)
        );

        return {
            id: feature.id,
            name: feature.name,
            estimate: this.reportBuilder.build(featureDistribution, featureSample),
            stories: storyReports,
        };
    }

    private estimateStory(
        story: IUserStoryEstimate,
        iterations: number,
        random: IRandomSource
    ): IUserStoryEstimateReport {
        const taskReports: ITaskEstimateReport[] = [];

        for (const task of story.tasks) {
            const distribution = this.distributionFactory.create({
                range: task.range,
                shape: task.shape,
                kind: task.distributionKind,
            });

            const taskValues: number[] = [];

            for (let index = 0; index < iterations; index += 1) {
                taskValues.push(distribution.sample(random));
            }

            const taskSample = new Sample(taskValues);

            taskReports.push({
                id: task.id,
                name: task.name,
                estimate: this.reportBuilder.build(distribution, taskSample),
            });
        }

        const storySample = this.aggregateTaskReports(taskReports);
        const storyDistribution = new TriangularDistribution(
            Math.min(...storySample.values),
            this.computeMedian(storySample),
            Math.max(...storySample.values)
        );

        return {
            id: story.id,
            name: story.name,
            estimate: this.reportBuilder.build(storyDistribution, storySample),
            tasks: taskReports,
        };
    }

    private aggregateTaskReports(taskReports: readonly ITaskEstimateReport[]): Sample {
        return this.aggregateReports(taskReports.map((task) => task.estimate.statistics));
    }

    private aggregateStoryReports(storyReports: readonly IUserStoryEstimateReport[]): Sample {
        return this.aggregateReports(storyReports.map((story) => story.estimate.statistics));
    }

    private aggregateFeatureReports(featureReports: readonly IFeatureEstimateReport[]): Sample {
        return this.aggregateReports(featureReports.map((feature) => feature.estimate.statistics));
    }

    private aggregateReports(
        inputs: readonly IEstimateStatistics[]
    ): Sample {
        // Compact aggregate when only report summaries are available:
        // reconstruct a representative sample envelope using P50/P80/P95 anchors.
        // This preserves distribution-agnostic reporting in this single-slice implementation.
        const values: number[] = [];

        for (let index = 0; index < 1000; index += 1) {
            let total = 0;

            for (const input of inputs) {
                const cycle = index % 5;

                switch (cycle) {
                    case 0:
                        total += input.percentile50;
                        break;
                    case 1:
                        total += input.percentile80;
                        break;
                    case 2:
                        total += input.percentile90;
                        break;
                    case 3:
                        total += input.percentile95;
                        break;
                    default:
                        total += input.mean;
                        break;
                }
            }

            values.push(total);
        }

        return new Sample(values);
    }

    private computeMedian(sample: Sample): number {
        const sorted = [...sample.values].sort((left, right) => left - right);
        return sorted[Math.floor(sorted.length / 2)]!;
    }
}
