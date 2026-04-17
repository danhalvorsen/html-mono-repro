import { Guard } from "./Guard.js";
import { IPoint } from "./IPoint.js";
import { Point } from "./Point.js";
 
export class Rectangle {
    public readonly id: string;
    public readonly position: Point;
    public readonly width: number;
    public readonly height: number;

    private constructor(params: {
        id: string;
        position: Point;
        width: number;
        height: number;
    }) {
        Guard.nonEmpty(params.id, "Rectangle.id");
        Guard.nonNegative(params.width, "Rectangle.width");
        Guard.nonNegative(params.height, "Rectangle.height");

        this.id = params.id;
        this.position = params.position;
        this.width = params.width;
        this.height = params.height;
    }

    public static create(params: {
        id: string;
        position: IPoint;
        width: number;
        height: number;
    }): Rectangle {
        return new Rectangle({
            id: params.id,
            position: Point.from(params.position),
            width: Math.max(0, params.width),
            height: Math.max(0, params.height),
        });
    }

    public static fromFragment(source: IFragment, index: number): Rectangle {
        Guard.finite(index, "Rectangle.fromFragment.index");

        return Rectangle.create({
            id: `p${source.pageNumber}-${index}`,
            position: source.boundingBox.position,
            width: source.boundingBox.width,
            height: source.boundingBox.height,
        });
    }

    public static fromMinMax(params: {
        id: string;
        min: IPoint;
        max: IPoint;
    }): Rectangle {
        const min = Point.from(params.min);
        const max = Point.from(params.max);

        const normalizedMin = Point.create(
            Math.min(min.x, max.x),
            Math.min(min.y, max.y)
        );

        const normalizedMax = Point.create(
            Math.max(min.x, max.x),
            Math.max(min.y, max.y)
        );

        return new Rectangle({
            id: params.id,
            position: normalizedMin,
            width: normalizedMax.x - normalizedMin.x,
            height: normalizedMax.y - normalizedMin.y,
        });
    }

    public static union(id: string, rectangles: readonly Rectangle[]): Rectangle {
        if (rectangles.length === 0) {
            throw new Error("Rectangle.union requires at least one rectangle.");
        }

        let minX = rectangles[0]!.left;
        let minY = rectangles[0]!.top;
        let maxX = rectangles[0]!.right;
        let maxY = rectangles[0]!.bottom;

        for (let index = 1; index < rectangles.length; index += 1) {
            const current = rectangles[index]!;
            minX = Math.min(minX, current.left);
            minY = Math.min(minY, current.top);
            maxX = Math.max(maxX, current.right);
            maxY = Math.max(maxY, current.bottom);
        }

        return Rectangle.fromMinMax({
            id,
            min: Point.create(minX, minY),
            max: Point.create(maxX, maxY),
        });
    }

    public get min(): Point {
        return this.position;
    }

    public get max(): Point {
        return Point.create(this.right, this.bottom);
    }

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
            this.position.x + (this.width / 2),
            this.position.y + (this.height / 2)
        );
    }

    public get aspectRatio(): number {
        return this.height === 0 ? 0 : this.width / this.height;
    }

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
            this.left > other.right ||
            this.bottom < other.top ||
            this.top > other.bottom
        );
    }

    public intersection(id: string, other: Rectangle): Rectangle | null {
        if (!this.intersects(other)) {
            return null;
        }

        return Rectangle.fromMinMax({
            id,
            min: Point.create(
                Math.max(this.left, other.left),
                Math.max(this.top, other.top)
            ),
            max: Point.create(
                Math.min(this.right, other.right),
                Math.min(this.bottom, other.bottom)
            ),
        });
    }

    public translate(dx: number, dy: number): Rectangle {
        Guard.finite(dx, "Rectangle.translate.dx");
        Guard.finite(dy, "Rectangle.translate.dy");

        return new Rectangle({
            id: this.id,
            position: this.position.translate(dx, dy),
            width: this.width,
            height: this.height,
        });
    }

    public scale(factor: number): Rectangle {
        Guard.nonNegative(factor, "Rectangle.scale.factor");

        return new Rectangle({
            id: this.id,
            position: this.position.scale(factor),
            width: this.width * factor,
            height: this.height * factor,
        });
    }

    public inflate(horizontal: number, vertical: number): Rectangle {
        Guard.finite(horizontal, "Rectangle.inflate.horizontal");
        Guard.finite(vertical, "Rectangle.inflate.vertical");

        return new Rectangle({
            id: this.id,
            position: Point.create(this.left - horizontal, this.top - vertical),
            width: Math.max(0, this.width + (horizontal * 2)),
            height: Math.max(0, this.height + (vertical * 2)),
        });
    }

    public withId(id: string): Rectangle {
        return new Rectangle({
            id,
            position: this.position,
            width: this.width,
            height: this.height,
        });
    }

    public round(decimals = 0): Rectangle {
        Guard.nonNegative(decimals, "Rectangle.round.decimals");

        const factor = 10 ** decimals;
        const roundValue = (value: number): number => Math.round(value * factor) / factor;

        return new Rectangle({
            id: this.id,
            position: Point.create(
                roundValue(this.position.x),
                roundValue(this.position.y)
            ),
            width: roundValue(this.width),
            height: roundValue(this.height),
        });
    }

    public toBoundingBox(): Readonly<{
        position: IPoint;
        width: number;
        height: number;
    }> {
        return Object.freeze({
            position: this.position.toJSON(),
            width: this.width,
            height: this.height,
        });
    }

    public toRecord(): Readonly<{
        id: string;
        position: IPoint;
        width: number;
        height: number;
        min: IPoint;
        max: IPoint;
        center: IPoint;
        area: number;
        aspectRatio: number;
    }> {
        return Object.freeze({
            id: this.id,
            position: this.position.toJSON(),
            width: this.width,
            height: this.height,
            min: this.min.toJSON(),
            max: this.max.toJSON(),
            center: this.center.toJSON(),
            area: this.area,
            aspectRatio: this.aspectRatio,
        });
    }
}