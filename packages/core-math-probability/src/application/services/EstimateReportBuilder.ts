import { IEstimateDistributionReport } from "../../domain/reports/IEstimateDistributionReport.js";
import { IEstimateReportBuilder } from "../../domain/reports/IEstimateReportBuilder.js";
import { IStatisticsService, IPercentileService, IContinuousProbabilityDistribution, Sample, Probability } from "../../domain/value-objects/Probability.js";

 export class EstimateReportBuilder implements IEstimateReportBuilder {
    public constructor(
        private readonly statistics: IStatisticsService,
        private readonly percentiles: IPercentileService
    ) { }

    public build(
        distribution: IContinuousProbabilityDistribution,
        sample: Sample
    ): IEstimateDistributionReport {
        return {
            distribution: {
                kind: distribution.kind,
                pdfSupported: true,
                cdfSupported: true,
                inverseCdfSupported: true,
            },
            statistics: {
                mean: this.statistics.mean(sample),
                variance: this.statistics.variancePopulation(sample),
                standardDeviation: this.statistics.standardDeviationPopulation(sample),
                minimum: this.statistics.minimum(sample),
                maximum: this.statistics.maximum(sample),
                percentile50: this.percentiles.percentile(sample, Probability.create(0.5)),
                percentile80: this.percentiles.percentile(sample, Probability.create(0.8)),
                percentile90: this.percentiles.percentile(sample, Probability.create(0.9)),
                percentile95: this.percentiles.percentile(sample, Probability.create(0.95)),
            },
        };
    }
}
