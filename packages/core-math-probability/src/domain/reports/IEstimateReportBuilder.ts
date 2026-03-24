import { IContinuousProbabilityDistribution, Sample } from "../value-objects/Probability.js";
import { IEstimateDistributionReport } from "./IEstimateDistributionReport.js";

export interface IEstimateReportBuilder {
    build(
        distribution: IContinuousProbabilityDistribution,
        sample: Sample
    ): IEstimateDistributionReport;
}
