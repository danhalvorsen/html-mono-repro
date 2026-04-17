import { Guard } from "./Guard.js";
import { IPoint } from "./IPoint.js";


export class Point implements IPoint {
    public readonly x: number;
    public readonly y: number;

    private constructor(x: number, y: number) {
        Guard.finite(x, "Point.x");
        Guard.finite(y, "Point.y");

        this.x = x;
        this.y = y;
    }

    public static create(x: number, y: number): Point {
        return new Point(x, y);
    }

    public static from(value: IPoint): Point {
        return new Point(value.x, value.y);
    }

    public add(other: IPoint): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public subtract(other: IPoint): Point {
        return new Point(this.x - other.x, this.y - other.y);
    }

    public translate(dx: number, dy: number): Point {
        Guard.finite(dx, "Point.translate.dx");
        Guard.finite(dy, "Point.translate.dy");

        return new Point(this.x + dx, this.y + dy);
    }

    public scale(factor: number): Point {
        Guard.finite(factor, "Point.scale.factor");
        return new Point(this.x * factor, this.y * factor);
    }

    public distanceTo(other: IPoint): number {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }

    public equals(other: IPoint): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public round(decimals = 0): Point {
        Guard.nonNegative(decimals, "Point.round.decimals");

        const factor = 10 ** decimals;

        return new Point(
            Math.round(this.x * factor) / factor,
            Math.round(this.y * factor) / factor
        );
    }

    public toJSON(): IPoint {
        return Object.freeze({
            x: this.x,
            y: this.y,
        });
    }
}
