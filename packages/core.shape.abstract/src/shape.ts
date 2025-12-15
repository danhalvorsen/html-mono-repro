export interface IShape {
    readonly type: string;

    /**
     * Produce a pure render description.
     * This is NOT a 3D object, not Three.js,
     * just domain data describing the shape.
     */
    render(): unknown;
}
export abstract class Shape implements IShape {
    abstract readonly type: string;

    /**
     * Every shape returns a serializable render description.
     * Hosts (Three.js, Canvas2D, WebGPU, SVG) interpret this.
     */
    abstract render(): unknown;
}