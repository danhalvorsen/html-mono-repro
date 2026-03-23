import { Probability, Sample, StatisticsService, PercentileService, EstimateReportBuilder, TriangularDistribution } from "core-math-probability/src/index.js";
import type { IContinuousProbabilityDistribution } from "../../src/index.js";
import { Mulberry32RandomSource } from "../../src/index.js";
import { EstimateRange } from "../../src/index.js";
import { EstimateShape } from "../../src/index.js";
import {
    DistributionKind,
    PertEstimateDistributionPolicy
} from "../../src/index.js";
import { BetaPertDistribution } from "../../src/index.js";
import {
    NormalDistribution
} from "../../src/index.js";
import {
    SkewNormalEstimateDistributionPolicy
} from "../../src/index.js";


export class ProbabilityFixture {
    public createRandom(seed = 123456789): IRandomSource {
        return new Mulberry32RandomSource(seed);
    }

    public createProbability(value = 0.5): Probability {
        return Probability.create(value);
    }

    public createSample(values: readonly number[] = [2, 4, 4, 4, 5, 5, 7, 9]): Sample {
        return new Sample(values);
    }

    public createEstimateRange(
        minimum = 8,
        mostLikely = 16,
        maximum = 40
    ): EstimateRange {
        return new EstimateRange(minimum, mostLikely, maximum);
    }

    public createEstimateShape(
        confidence = 0.7,
        optimismBias = 0.2,
        tailWeight = 1.2
    ): EstimateShape {
        return new EstimateShape(confidence, optimismBias, tailWeight);
    }

    public createDistributionContext(
        kind: DistributionKind = DistributionKind.Pert
    ): IEstimateDistributionContext {
        return {
            kind,
            range: this.createEstimateRange(),
            shape: this.createEstimateShape(),
        };
    }

    public createStatisticsService(): IStatisticsService {
        return new StatisticsService();
    }

    public createPercentileService(): IPercentileService {
        return new PercentileService();
    }

    public createMonteCarloSimulator(): IMonteCarloSimulator {
        return new MonteCarloSimulator();
    }

    public createReportBuilder(): IEstimateReportBuilder {
        return new EstimateReportBuilder(
            this.createStatisticsService(),
            this.createPercentileService()
        );
    }

    public createTriangularDistribution(): IContinuousProbabilityDistribution {
        return new TriangularDistribution(10, 20, 40);
    }

    public createPertDistribution(): IContinuousProbabilityDistribution {
        return new BetaPertDistribution(10, 20, 40, 4);
    }

    public createSkewNormalEstimateDistribution(): IContinuousProbabilityDistribution {
        return new SkewNormalEstimateDistribution(
            this.createEstimateRange(10, 20, 40),
            this.createEstimateShape(0.6, 0.35, 1.0)
        );
    }

    public createNormalDistribution(mean = 0, standardDeviation = 1): NormalDistribution {
        return new NormalDistribution(mean, standardDeviation);
    }

    public createStudentTDistribution(df = 10): StudentTDistribution {
        return new StudentTDistribution(df);
    }

    public createTriangularPolicy(): TriangularEstimateDistributionPolicy {
        return new TriangularEstimateDistributionPolicy();
    }

    public createPertPolicy(): PertEstimateDistributionPolicy {
        return new PertEstimateDistributionPolicy();
    }

    public createSkewNormalPolicy(): SkewNormalEstimateDistributionPolicy {
        return new SkewNormalEstimateDistributionPolicy();
    }

    public createDistributionFactory(): IEstimateDistributionFactory {
        return new EstimateDistributionFactory([
            this.createTriangularPolicy(),
            this.createPertPolicy(),
            this.createSkewNormalPolicy(),
        ]);
    }

    public createProjectEstimator(): IProjectEstimator {
        return ProbabilityEstimationCompositionRoot.createProjectEstimator();
    }

    public createZTest(): IOneSampleZTest {
        return ProbabilityEstimationCompositionRoot.createZTest();
    }

    public createTTest(): IOneSampleTTest {
        return ProbabilityEstimationCompositionRoot.createTTest();
    }

    public createProject(): IProjectEstimate {
        return {
            id: "project-spaceship",
            name: "Build a Space Ship",
            features: [
                {
                    id: "feature-propulsion",
                    name: "Propulsion",
                    stories: [
                        {
                            id: "story-engine-control",
                            name: "Engine Control",
                            tasks: [
                                {
                                    id: "task-throttle-ui",
                                    name: "Throttle UI",
                                    range: new EstimateRange(8, 16, 40),
                                    shape: new EstimateShape(0.7, 0.2, 1.2),
                                    distributionKind: DistributionKind.Pert,
                                },
                                {
                                    id: "task-engine-api",
                                    name: "Engine API",
                                    range: new EstimateRange(12, 24, 56),
                                    shape: new EstimateShape(0.6, 0.35, 1.0),
                                    distributionKind: DistributionKind.Pert,
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "feature-navigation",
                    name: "Navigation",
                    stories: [
                        {
                            id: "story-course-planner",
                            name: "Course Planner",
                            tasks: [
                                {
                                    id: "task-route-service",
                                    name: "Route Service",
                                    range: new EstimateRange(10, 20, 45),
                                    shape: new EstimateShape(0.65, 0.1, 1.4),
                                    distributionKind: DistributionKind.Triangular,
                                },
                                {
                                    id: "task-star-map-ui",
                                    name: "Star Map UI",
                                    range: new EstimateRange(14, 26, 60),
                                    shape: new EstimateShape(0.45, 0.5, 0.9),
                                    distributionKind: DistributionKind.SkewNormal,
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }

    public sampleDistribution(
        distribution: IContinuousProbabilityDistribution,
        count = 2000,
        seed = 42
    ): readonly number[] {
        const random = this.createRandom(seed);
        const values: number[] = [];

        for (let index = 0; index < count; index += 1) {
            values.push(distribution.sample(random));
        }

        return values;
    }

    public assertMonotonicNonDecreasing(values: readonly number[]): void {
        for (let index = 1; index < values.length; index += 1) {
            if (values[index] < values[index - 1]) {
                throw new Error(`Sequence is not monotonic at index ${index}.`);
            }
        }
    }
}
