// src/Fragment.ts

import { FragmentKind } from "./core/FragmentKind.js";
import { Guard } from "./core/Guard.js";
import { IBoundingBox } from "./core/IBoundingBox.js";
import { IFragment } from "./core/IFragment.js";
import { IPoint } from "./core/IPoint.js";
import { Rectangle } from "./Rectangle.js";

export abstract class Fragment<TSelf extends IFragment<TSelf>>
    implements IFragment<TSelf> {
    public readonly index: number;
    public readonly pageNumber: number;
    public readonly rectangle: Rectangle;

    protected constructor(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
    }) {
        Guard.nonNegativeInteger(params.index, "Fragment.index");
        Guard.positiveInteger(params.pageNumber, "Fragment.pageNumber");

        if (!params.rectangle) {
            throw new Error("Fragment.rectangle is required");
        }

        this.index = params.index;
        this.pageNumber = params.pageNumber;
        this.rectangle = params.rectangle;
    }

    public abstract get kind(): FragmentKind;

    public get id(): string {
        return this.rectangle.id;
    }

    public get boundingBox(): IBoundingBox {
        return this.rectangle.toBoundingBox();
    }

    public translate(dx: number, dy: number): TSelf {
        if (!Number.isFinite(dx)) {
            throw new Error("Fragment.translate.dx must be finite");
        }

        if (!Number.isFinite(dy)) {
            throw new Error("Fragment.translate.dy must be finite");
        }

        return this.withRectangle(this.rectangle.translate(dx, dy));
    }

    public scaleGeometry(factor: number): TSelf {
        if (!(factor > 0)) {
            throw new Error("Fragment.scaleGeometry.factor must be > 0");
        }

        return this.withRectangle(this.rectangle.scale(factor));
    }

    public intersects(other: { readonly rectangle: Rectangle }): boolean {
        if (!other) {
            throw new Error("Fragment.intersects.other is required");
        }

        return this.rectangle.intersects(other.rectangle);
    }

    public contains(point: IPoint): boolean {
        if (!point) {
            throw new Error("Fragment.contains.point is required");
        }

        return this.rectangle.contains(point);
    }

    protected abstract withRectangle(rectangle: Rectangle): TSelf;
}
