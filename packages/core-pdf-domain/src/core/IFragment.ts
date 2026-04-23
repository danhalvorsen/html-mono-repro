import type { FragmentKind } from "./FragmentKind.js";
import type { IBoundingBox } from "./IBoundingBox.js";
import type { IPoint } from "./IPoint.js";
import { Rectangle } from "./Rectangle.js";

export interface IFragment<TSelf extends IFragment<TSelf>> {
    readonly kind: FragmentKind;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly index?: number;
    readonly rectangle?: Rectangle;
    readonly id?: string;

    translate?(dx: number, dy: number): TSelf;
    scaleGeometry?(factor: number): TSelf;
    intersects?(other: { readonly rectangle: Rectangle }): boolean;
    contains?(point: IPoint): boolean;
}
