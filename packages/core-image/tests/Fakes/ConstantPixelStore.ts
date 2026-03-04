import { IFakePixelStore } from "./IFakePixelStore.js";

/** Always returns the same pixel (ideal for metadata-only tests). */

export class ConstantPixelStore implements IFakePixelStore {
    constructor(private readonly pixel: readonly number[]) { }
    getPixel(_x: number, _y: number): readonly number[] { return this.pixel; }
    setPixel(_x: number, _y: number, _value: readonly number[]): void { }
}
