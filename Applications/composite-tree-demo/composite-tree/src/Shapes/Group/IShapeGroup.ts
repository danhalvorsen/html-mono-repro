import type { IShape } from '../../Shape/IShape';
import type { DrawableShape } from "../../DrawableShape";

export interface IShapeGroup extends IShape {
    readonly kind: 'group';
    readonly shapes: readonly DrawableShape[];
}
