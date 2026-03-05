import { type IImage, PixelFormat, type IImageBuffer, type IImageMetadata } from "core-image/src/common/implementation/Image.Common.js";
import { FakeImageConfig } from "./FakeImageConfig.js";
import { FakeImageBuilder } from "./FakeImageBuilder.js";
import { IFakePixelStore } from "./IFakePixelStore.js";

export class FakeImage implements IImage {

    readonly width: number;
    readonly height: number;
    readonly format: PixelFormat;
    readonly buffer: IImageBuffer;
    readonly metadata?: IImageMetadata;

    private readonly store: IFakePixelStore;
    private readonly defaultPixel: readonly number[];

    constructor(cfg: FakeImageConfig) {

        this.width = cfg.width;
        this.height = cfg.height;
        this.format = cfg.format;
        this.metadata = cfg.metadata;

        this.buffer = {
            width: cfg.width,
            height: cfg.height,
            channels: cfg.channels,
            data: cfg.data
        };

        this.store = cfg.store;
        this.defaultPixel = cfg.defaultPixel;
    }

    getPixel(x: number, y: number): readonly number[] {
        // Store decides behavior; default pixel is only here as a stable fallback
        return this.store.getPixel(x, y) ?? this.defaultPixel;
    }

    setPixel(x: number, y: number, value: readonly number[]): void {
        this.store.setPixel(x, y, value);
    }

    static builder(): FakeImageBuilder {
        return new FakeImageBuilder();
    }
}
