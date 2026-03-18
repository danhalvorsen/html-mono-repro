// ====================================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/src/three/core/ThreeHost.ts
// ====================================================================================

export interface IThreeHost {
    getContainer(): HTMLElement;
    getViewportWidth(): number;
    getViewportHeight(): number;
    attachCanvas(canvas: HTMLCanvasElement): void;
}
