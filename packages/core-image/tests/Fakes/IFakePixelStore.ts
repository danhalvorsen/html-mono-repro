// ================================================================
// Pixel Store Strategy (OCP extension point)
// ================================================================

export interface IFakePixelStore {
    getPixel(x: number, y: number): readonly number[];
    setPixel(x: number, y: number, value: readonly number[]): void;
}
