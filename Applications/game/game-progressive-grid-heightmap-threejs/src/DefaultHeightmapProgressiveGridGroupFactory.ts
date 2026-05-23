import type { IProgressiveGrid } from "@monorepo/game-progressive-grid/src/index.js";
import {
  ThreeProgressiveGridGroupFactory,
  type IProgressiveGridGroupFactory,
  type ProgressiveGridGroupOptions,
} from "@monorepo/game-progressive-grid-threejs/src/index.js";
import type { Group } from "three";
import type { HeightmapProgressiveGridGroupFactoryOptions } from "./HeightmapProgressiveGridGroupFactoryOptions.js";
import type { IHeightmapProgressiveGridGroupFactory } from "./IHeightmapProgressiveGridGroupFactory.js";
import type { IImageDataLoader } from "./IImageDataLoader.js";
import { ImageHeightmapProjector } from "./ImageHeightmapProjector.js";
import { RgbaHeightSampler } from "./RgbaHeightSampler.js";

export class DefaultHeightmapProgressiveGridGroupFactory
  implements IHeightmapProgressiveGridGroupFactory {
  private readonly imageDataLoader: IImageDataLoader;
  private readonly groupFactory: IProgressiveGridGroupFactory;

  public constructor(
    imageDataLoader: IImageDataLoader,
    groupFactory: IProgressiveGridGroupFactory = new ThreeProgressiveGridGroupFactory(),
  ) {
    this.imageDataLoader = imageDataLoader;
    this.groupFactory = groupFactory;
  }

  public async createGroupFromImage(
    grid: IProgressiveGrid,
    imageSource: string,
    options: HeightmapProgressiveGridGroupFactoryOptions = {},
  ): Promise<Group> {
    const imageData = await this.imageDataLoader.load(imageSource);
    const sampler = new RgbaHeightSampler(imageData, options.samplerOptions);
    const projector = new ImageHeightmapProjector(sampler, options.projectorOptions);

    const sourcePatchMeshOptions = options.patchMeshOptions;
    const sourceGeometryOptions = sourcePatchMeshOptions?.geometryOptions;

    const groupOptions: ProgressiveGridGroupOptions = {
      ...(options.name === undefined ? {} : { name: options.name }),
      patchMeshOptions: {
        ...(sourcePatchMeshOptions ?? {}),
        geometryOptions: {
          ...(sourceGeometryOptions ?? {}),
          projector,
        },
      },
    };

    return this.groupFactory.createGroup(grid, groupOptions);
  }
}
