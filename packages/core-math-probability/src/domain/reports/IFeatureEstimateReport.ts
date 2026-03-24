import { IEstimateDistributionReport } from "./IEstimateDistributionReport.js";
import { IUserStoryEstimateReport } from "./IUserStoryEstimateReport.js";


export interface IFeatureEstimateReport {
    readonly id: string;
    readonly name: string;
    readonly estimate: IEstimateDistributionReport;
    readonly stories: readonly IUserStoryEstimateReport[];
}
