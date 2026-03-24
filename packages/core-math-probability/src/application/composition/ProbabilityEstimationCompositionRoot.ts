 
// =====================================================================================
// COMPOSITION ROOT
// =====================================================================================

import { IOneSampleZTest } from "../../domain/contracts/IOneSampleZTest.js";
import { IProjectEstimator } from "../../domain/contracts/IProjectEstimator.js";
import { IEstimateReportBuilder } from "../../domain/reports/IEstimateReportBuilder.js";
import { IEstimateDistributionFactory, IOneSampleTTest } from "../../domain/value-objects/Probability.js";
import { EstimateDistributionFactory } from "../../infrastructure/distribution-policies/EstimateDistributionFactory.js";
import { PertEstimateDistributionPolicy } from "../../infrastructure/distribution-policies/PertEstimateDistributionPolicy.js";
import { SkewNormalEstimateDistributionPolicy } from "../../infrastructure/distribution-policies/SkewNormalEstimateDistributionPolicy.js";
import { TriangularEstimateDistributionPolicy } from "../../infrastructure/distribution-policies/TriangularEstimateDistributionPolicy.js";
import { EstimateReportBuilder } from "../services/EstimateReportBuilder.js";
import { PercentileService } from "../services/PercentileService.js";
import { ProjectEstimator } from "../services/ProjectEstimator.js";
import { StatisticsService } from "../services/StatisticsService.js";
import { OneSampleTTest } from "../testing/OneSampleTTest.js";
import { OneSampleZTest } from "../testing/OneSampleZTest.legacy.js";

export class ProbabilityEstimationCompositionRoot {
    public static createProjectEstimator(): IProjectEstimator {
        const statistics = new StatisticsService();
        const percentiles = new PercentileService();
        const reportBuilder = new EstimateReportBuilder(statistics, percentiles);

        const factory = new EstimateDistributionFactory([
            new TriangularEstimateDistributionPolicy(),
            new PertEstimateDistributionPolicy(),
            new SkewNormalEstimateDistributionPolicy(),
        ]);

        return new ProjectEstimator(factory, reportBuilder);
    }

    public static createDistributionFactory(): IEstimateDistributionFactory {
        return new EstimateDistributionFactory([
            new TriangularEstimateDistributionPolicy(),
            new PertEstimateDistributionPolicy(),
            new SkewNormalEstimateDistributionPolicy(),
        ]);
    }

    public static createReportBuilder(): IEstimateReportBuilder {
        return new EstimateReportBuilder(
            new StatisticsService(),
            new PercentileService()
        );
    }

    public static createZTest(): IOneSampleZTest {
        return new OneSampleZTest();
    }

    public static createTTest(): IOneSampleTTest {
        return new OneSampleTTest();
    }
}
