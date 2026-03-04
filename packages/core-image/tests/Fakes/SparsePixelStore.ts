import { IFakePixelStore } from "./IFakePixelStore.js";

/** Sparse map-backed store, with a fallback pixel. */

export class SparsePixelStore implements IFakePixelStore {
    private readonly pixels = new Map<string, readonly number[]>();

    constructor(private readonly fallback: readonly number[] = [0, 0, 0, 255]) { }

    getPixel(x: number, y: number): readonly number[] {
        return this.pixels.get(this.key(x, y)) ?? this.fallback;
    }

    setPixel(x: number, y: number, value: readonly number[]): void {
        this.pixels.set(this.key(x, y), value);
    }

    private key(x: number, y: number): string {
        return `${x},${y}`;
    }
}
