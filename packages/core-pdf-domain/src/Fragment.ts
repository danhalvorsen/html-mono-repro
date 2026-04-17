import { Guard } from "./Guard.js";
import { FragmentKind } from "./FragmentKind.js";
import { IPoint } from "./IPoint.js";
import { Rectangle } from "./Rectangle.js";


export abstract class Fragment {
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

        this.index = params.index;
        this.pageNumber = params.pageNumber;
        this.rectangle = params.rectangle;
    }

    public abstract get kind(): FragmentKind;

    public get id(): string {
        return this.rectangle.id;
    }

    public translate(dx: number, dy: number): Fragment {
        return this.withRectangle(this.rectangle.translate(dx, dy));
    }

    public scaleGeometry(factor: number): Fragment {
        return this.withRectangle(this.rectangle.scale(factor));
    }

    public intersects(other: Fragment): boolean {
        return this.rectangle.intersects(other.rectangle);
    }

    public contains(point: IPoint): boolean {
        return this.rectangle.contains(point);
    }

    public toBoundingBoxRecord(): BoundingBoxRecord {
        return Object.freeze({
            rectangle: Object.freeze({
                id: this.rectangle.id,
                position: this.rectangle.position.toJSON(),
                width: this.rectangle.width,
                height: this.rectangle.height,
            }),
            geometry: Object.freeze({
                min: this.rectangle.min.toJSON(),
                max: this.rectangle.max.toJSON(),
                center: this.rectangle.center.toJSON(),
                area: this.rectangle.area,
                aspectRatio: this.rectangle.aspectRatio,
            }),
            fragment: Object.freeze({
                kind: this.kind,
                pageNumber: this.pageNumber,
                fragmentIndex: this.index,
            }),
        });
    }

    protected abstract withRectangle(rectangle: Rectangle): Fragment;
}
