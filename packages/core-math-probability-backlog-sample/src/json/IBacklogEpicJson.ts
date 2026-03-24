import { IBacklogFeatureJson } from "./IBacklogFeatureJson.js";

export interface IBacklogEpicJson {
    readonly id: string;
    readonly title: string;
    readonly features: readonly IBacklogFeatureJson[];
}
