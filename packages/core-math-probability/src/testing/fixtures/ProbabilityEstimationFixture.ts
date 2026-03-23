import { IRandomSource, Mulberry32RandomSource, IProjectEstimate, EstimateRange, EstimateShape, DistributionKind, Sample } from "../../domain/value-objects/Probability.js";

export class ProbabilityEstimationFixture {
    public createRandom(seed = 123456789): IRandomSource {
        return new Mulberry32RandomSource(seed);
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

    public createSample(): Sample {
        return new Sample([2, 4, 4, 4, 5, 5, 7, 9]);
    }
}
