import { IEstimateDistributionReport } from "./IEstimateDistributionReport.js";
import { ITaskEstimateReport } from "./ITaskEstimateReport.js";

export interface IUserStoryEstimateReport {
    readonly id: string;
    readonly name: string;
    readonly estimate: IEstimateDistributionReport;
    readonly tasks: readonly ITaskEstimateReport[];
}
