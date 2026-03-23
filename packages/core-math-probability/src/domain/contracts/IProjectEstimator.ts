import { IProjectEstimateReport } from "../reports/IProjectEstimateReport.js";
import { IProjectEstimate, IRandomSource } from "../value-objects/Probability.js";

export interface IProjectEstimator {
    estimate(
        project: IProjectEstimate,
        iterations: number,
        random: IRandomSource
    ): IProjectEstimateReport;
}
