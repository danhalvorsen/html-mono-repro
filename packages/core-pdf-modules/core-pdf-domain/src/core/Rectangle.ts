import { Guard } from "./Guard.js";
import type { IPoint } from "./IPoint.js";
import { Point } from "./Point.js";
import type { ITextFragment } from "./ITextFragment.js";

export class Rectangle {
    public readonly id: string;
    public readonly position: Point;
    public readonly width: number;
    public readonly height: number;

    private constructor(params: {
        id: string;
        position: IPoint;
        width: number;
        height: number;
    }) {
        Guard.nonEmpty(params.id, "Rectangle.id");
        Guard.finite(params.width, "Rectangle.width");
        Guard.finite(params.height, "Rectangle.height");
        Guard.nonNegative(params.width, "Rectangle.width");
        Guard.nonNegative(params.height, "Rectangle.height");

        this.id = params.id;
        this.position = Point.from(params.position);
        this.width = params.width;
        this.height = params.height;
    }

    public static create(params: {
        id: string;
        position: IPoint;
        width: number;
        height: number;
    }): Rectangle {
        return new Rectangle(params);
    }

    public static fromMinMax(params: {
        id: string;
        min: IPoint;
        max: IPoint;
    }): Rectangle {
        Guard.nonEmpty(params.id, "Rectangle.fromMinMax.id");

        const minX = Math.min(params.min.x, params.max.x);
        const minY = Math.min(params.min.y, params.max.y);
        const maxX = Math.max(params.min.x, params.max.x);
        const maxY = Math.max(params.min.y, params.max.y);

        return new Rectangle({
            id: params.id,
            position: { x: minX, y: minY },
            width: maxX - minX,
            height: maxY - minY
        });
    }

    public static fromTextFragment(source: ITextFragment, index: number): Rectangle {
        Guard.nonNegativeInteger(index, "Rectangle.fromTextFragment.index");

        return Rectangle.create({
            id: `p${source.pageNumber}-${index}`,
            position: source.boundingBox.position,
            width: source.boundingBox.width,
            height: source.boundingBox.height
        });
    }

    public static union(id: string, rectangles: readonly Rectangle[]): Rectangle {
        Guard.nonEmpty(id, "Rectangle.union.id");

        if (rectangles.length === 0) {
            throw new Error("Rectangle.union: rectangles array cannot be empty");
        }

        const first = rectangles[0]!;
        let minX = first.left;
        let minY = first.top;
        let maxX = first.right;
        let maxY = first.bottom;

        for (let i = 1; i < rectangles.length; i++) {
            const rect = rectangles[i]!;
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        }

        return Rectangle.fromMinMax({
            id,
            min: { x: minX, y: minY },
            max: { x: maxX, y: maxY }
        });
    }

    // Properties
    public get left(): number {
        return this.position.x;
    }

    public get top(): number {
        return this.position.y;
    }

    public get right(): number {
        return this.position.x + this.width;
    }

    public get bottom(): number {
        return this.position.y + this.height;
    }

    public get area(): number {
        return this.width * this.height;
    }

    public get center(): Point {
        return Point.create(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
    }

    public get aspectRatio(): number {
        return this.height === 0 ? 0 : this.width / this.height;
    }

    // Methods
    public contains(point: IPoint): boolean {
        return (
            point.x >= this.left &&
            point.x <= this.right &&
            point.y >= this.top &&
            point.y <= this.bottom
        );
    }

    public intersects(other: Rectangle): boolean {
        return !(
            this.right < other.left ||
            other.right < this.left ||
            this.bottom < other.top ||
            other.bottom < this.top
        );
    }

    public intersection(id: string, other: Rectangle): Rectangle | null {
        if (!this.intersects(other)) {
            return null;
        }

        const minX = Math.max(this.left, other.left);
        const minY = Math.max(this.top, other.top);
        const maxX = Math.min(this.right, other.right);
        const maxY = Math.min(this.bottom, other.bottom);

        return Rectangle.fromMinMax({
            id,
            min: { x: minX, y: minY },
            max: { x: maxX, y: maxY }
        });
    }

    public translate(dx: number, dy: number): Rectangle {
        Guard.finite(dx, "Rectangle.translate.dx");
        Guard.finite(dy, "Rectangle.translate.dy");

        return new Rectangle({
            id: this.id,
            position: this.position.translate(dx, dy),
            width: this.width,
            height: this.height
        });
    }

    public scale(factor: number): Rectangle {
        Guard.finite(factor, "Rectangle.scale.factor");

        if (!(factor > 0)) {
            throw new Error("Rectangle.scale.factor must be > 0");
        }

        return new Rectangle({
            id: this.id,
            position: this.position.scale(factor),
            width: this.width * factor,
            height: this.height * factor
        });
    }

    public inflate(dx: number, dy: number): Rectangle {
        Guard.finite(dx, "Rectangle.inflate.dx");
        Guard.finite(dy, "Rectangle.inflate.dy");

        return new Rectangle({
            id: this.id,
            position: Point.create(this.left - dx, this.top - dy),
            width: this.width + 2 * dx,
            height: this.height + 2 * dy
        });
    }

    public round(decimals: number): Rectangle {
        Guard.nonNegativeInteger(decimals, "Rectangle.round.decimals");

        const factor = Math.pow(10, decimals);

        return new Rectangle({
            id: this.id,
            position: Point.create(
                Math.round(this.left * factor) / factor,
                Math.round(this.top * factor) / factor
            ),
            width: Math.round(this.width * factor) / factor,
            height: Math.round(this.height * factor) / factor
        });
    }

    public toBoundingBox(): {
        readonly position: IPoint;
        readonly width: number;
        readonly height: number;
    } {
        return Object.freeze({
            position: { x: this.position.x, y: this.position.y },
            width: this.width,
            height: this.height
        });
    }
}
