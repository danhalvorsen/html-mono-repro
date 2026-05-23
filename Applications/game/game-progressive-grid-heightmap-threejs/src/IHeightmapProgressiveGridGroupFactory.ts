import type { IProgressiveGrid } from "@monorepo/game-progressive-grid/src/index.js";
import type { Group } from "three";
import type { HeightmapProgressiveGridGroupFactoryOptions } from "./HeightmapProgressiveGridGroupFactoryOptions.js";

export interface IHeightmapProgressiveGridGroupFactory {
  createGroupFromImage(
    grid: IProgressiveGrid,
    imageSource: string,
    options?: HeightmapProgressiveGridGroupFactoryOptions,
  ): Promise<Group>;
}
