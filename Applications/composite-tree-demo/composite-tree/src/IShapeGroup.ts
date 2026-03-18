import type { IShape } from "./shape-model";
import type { DrawableShape } from "./DrawableShape";


export interface IShapeGroup extends IShape {
    readonly kind: 'group';
    readonly shapes: readonly DrawableShape[];
}
