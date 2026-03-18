import type { IShape } from "./shape-model";

export interface IGridShape extends IShape {
    readonly kind: 'grid';
    readonly width: number;
    readonly height: number;
    readonly spacing: number;
    readonly majorEvery: number;
}
