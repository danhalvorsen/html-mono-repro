import type { Group } from "three";
import type { IProgressiveGrid } from "@monorepo/game-progressive-grid";
import type { ProgressiveGridGroupOptions } from "./ProgressiveGridGroupOptions.js";

export interface IProgressiveGridGroupFactory {
  createGroup(
    grid: IProgressiveGrid,
    options?: ProgressiveGridGroupOptions,
  ): Group;
}
