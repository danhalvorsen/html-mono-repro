// src/IBacklogTaskShapeMapper.ts

import type { EstimateShape } from "@monorepo/core-math-probability";
import type { IBacklogTaskJson } from "./json/IBacklogTaskJson.js";

export interface IBacklogTaskShapeMapper {
  mapTask(task: IBacklogTaskJson): EstimateShape;
}