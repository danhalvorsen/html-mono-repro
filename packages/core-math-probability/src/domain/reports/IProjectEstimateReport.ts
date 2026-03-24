import { IEstimateDistributionReport } from "./IEstimateDistributionReport.js";
import { IFeatureEstimateReport } from "./IFeatureEstimateReport.js";


export interface IProjectEstimateReport {
    readonly id: string;
    readonly name: string;
    readonly estimate: IEstimateDistributionReport;
    readonly features: readonly IFeatureEstimateReport[];
}
