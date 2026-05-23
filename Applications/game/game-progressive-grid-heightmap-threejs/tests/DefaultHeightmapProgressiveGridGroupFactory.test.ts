import type { IProgressiveGrid } from "@monorepo/game-progressive-grid";
import type {
  IProgressiveGridGroupFactory,
  ProgressiveGridGroupOptions,
} from "@monorepo/game-progressive-grid-threejs";
import { Group } from "three";
import { describe, expect, it } from "vitest";
import {
  DefaultHeightmapProgressiveGridGroupFactory,
  ImageHeightmapProjector,
  type IImageDataLoader,
  type RgbaImageData,
} from "../src/index.js";

class FakeImageDataLoader implements IImageDataLoader {
  public loadedSource: string | undefined;

  public async load(source: string): Promise<RgbaImageData> {
    this.loadedSource = source;

    return {
      width: 1,
      height: 1,
      data: new Uint8ClampedArray([255, 255, 255, 255]),
    };
  }
}

class CapturingProgressiveGridGroupFactory implements IProgressiveGridGroupFactory {
  public options: ProgressiveGridGroupOptions | undefined;

  public createGroup(_grid: IProgressiveGrid, options?: ProgressiveGridGroupOptions): Group {
    this.options = options;
    return new Group();
  }
}

describe("DefaultHeightmapProgressiveGridGroupFactory", () => {
  it("loads image data and passes a heightmap projector into the existing grid factory", async () => {
    const imageDataLoader = new FakeImageDataLoader();
    const groupFactory = new CapturingProgressiveGridGroupFactory();
    const factory = new DefaultHeightmapProgressiveGridGroupFactory(imageDataLoader, groupFactory);

    await factory.createGroupFromImage(
      { getPatches: () => [] } as unknown as IProgressiveGrid,
      "/heightmap.png",
      {
        name: "terrain",
        patchMeshOptions: {
          namePrefix: "heightmap-patch-",
        },
        projectorOptions: {
          amplitude: 50,
        },
      },
    );

    expect(imageDataLoader.loadedSource).toBe("/heightmap.png");
    expect(groupFactory.options?.name).toBe("terrain");
    expect(groupFactory.options?.patchMeshOptions?.namePrefix).toBe("heightmap-patch-");
    expect(
      groupFactory.options?.patchMeshOptions?.geometryOptions?.projector,
    ).toBeInstanceOf(ImageHeightmapProjector);
  });
});