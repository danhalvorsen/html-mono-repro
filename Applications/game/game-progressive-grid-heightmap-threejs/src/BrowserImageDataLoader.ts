import { BrowserHtmlImageElementFactory } from "./BrowserHtmlImageElementFactory.js";
import type { BrowserImageDataLoaderOptions } from "./BrowserImageDataLoaderOptions.js";
import type { IHtmlImageElementFactory } from "./IHtmlImageElementFactory.js";
import type { IImageDataLoader } from "./IImageDataLoader.js";
import type { RgbaImageData } from "./RgbaImageData.js";

export class BrowserImageDataLoader implements IImageDataLoader {
  private readonly document: Document;
  private readonly imageFactory: IHtmlImageElementFactory;
  private readonly crossOrigin: BrowserImageDataLoaderOptions["crossOrigin"];

  public constructor(options: BrowserImageDataLoaderOptions) {
    this.document = options.document;
    this.imageFactory = options.imageFactory ?? new BrowserHtmlImageElementFactory();
    this.crossOrigin = options.crossOrigin;
  }

  public async load(source: string): Promise<RgbaImageData> {
    if (source.trim().length === 0) {
      throw new Error("Heightmap image source cannot be empty.");
    }

    const image = await this.loadImage(source);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    if (width < 1 || height < 1) {
      throw new Error("Heightmap image has invalid dimensions.");
    }

    const canvas = this.document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (context === null) {
      throw new Error("Could not create 2D canvas context for heightmap image.");
    }

    context.drawImage(image, 0, 0, width, height);

    return context.getImageData(0, 0, width, height);
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    const image = this.imageFactory.create();

    if (this.crossOrigin !== undefined) {
      image.crossOrigin = this.crossOrigin;
    }

    return new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load heightmap image: ${source}`));
      image.src = source;
    });
  }
}