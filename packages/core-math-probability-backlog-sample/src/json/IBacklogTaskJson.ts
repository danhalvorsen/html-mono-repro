import { IBacklogEstimateJson } from "./IBacklogEstimateJson.js";

export interface IBacklogTaskJson {
    readonly id: string;
    readonly type: string;
    readonly title: string;
    readonly estimate: IBacklogEstimateJson;
}
