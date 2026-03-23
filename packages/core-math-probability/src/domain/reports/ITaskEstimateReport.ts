import { IEstimateDistributionReport } from "./IEstimateDistributionReport.js";

export interface ITaskEstimateReport {
    readonly id: string;
    readonly name: string;
    readonly estimate: IEstimateDistributionReport;
}
