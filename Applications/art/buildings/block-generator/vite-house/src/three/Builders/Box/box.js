// ============================================================================
// FILE: src/three/Builders/Box/Box.ts
// ============================================================================
export class Box {
    width;
    height;
    depth;
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        if (!Number.isFinite(width) || width <= 0) {
            throw new Error("width must be > 0");
        }
        if (!Number.isFinite(height) || height <= 0) {
            throw new Error("height must be > 0");
        }
        if (!Number.isFinite(depth) || depth <= 0) {
            throw new Error("depth must be > 0");
        }
        Object.freeze(this);
    }
}
//# sourceMappingURL=box.js.map