import { BrowserImageDataLoader } from "./BrowserImageDataLoader.js";
import type { BrowserImageDataLoaderOptions } from "./BrowserImageDataLoaderOptions.js";
import { DefaultHeightmapProgressiveGridGroupFactory } from "./DefaultHeightmapProgressiveGridGroupFactory.js";
import type { IHeightmapProgressiveGridGroupFactory } from "./IHeightmapProgressiveGridGroupFactory.js";
import type { IImageDataLoader } from "./IImageDataLoader.js";

export type HeightmapProgressiveGridServices = Readonly<{
  readonly imageDataLoader: IImageDataLoader;
  readonly groupFactory: IHeightmapProgressiveGridGroupFactory;
}>;

export function createBrowserHeightmapProgressiveGridServices(
  options: BrowserImageDataLoaderOptions,
): HeightmapProgressiveGridServices {
  const imageDataLoader = new BrowserImageDataLoader(options);
  const groupFactory = new DefaultHeightmapProgressiveGridGroupFactory(imageDataLoader);

  return {
    imageDataLoader,
    groupFactory,
  };
}