import { IBacklogUserStoryJson } from "../IBacklogUserStoryJson.js";

export interface IBacklogFeatureJson {
    readonly id: string;
    readonly title: string;
    readonly userStories: readonly IBacklogUserStoryJson[];
}
