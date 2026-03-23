 
import { IDistributionSummary } from "../contracts/IDistributionSummary.js";
import { IEstimateStatistics } from "./IEstimateStatistics.js";

export interface IEstimateDistributionReport {
    readonly distribution: IDistributionSummary;
    readonly statistics: IEstimateStatistics;
}
