import { IBacklogTaskJson } from "./json/IBacklogTaskJson.js";

export interface IBacklogUserStoryJson {
    readonly id: string;
    readonly title: string;
    readonly tasks: readonly IBacklogTaskJson[];
}
