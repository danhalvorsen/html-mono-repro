import { IBacklogEpicJson } from "./IBacklogEpicJson.js";

export interface IBacklogRootJson {
    readonly epics: readonly IBacklogEpicJson[];
}
