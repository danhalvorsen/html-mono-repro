import { Point } from "@monorepo/core-math";
import type { IDraggable, Shape } from "../../src";

export class TestDraggable extends HTMLElement implements IDraggable {
    public readonly shape = {} as Shape;
    public position: Point;
    public hit = false;

    public readonly setPositionCalls: Point[] = [];
    public readonly containsPointCalls: Point[] = [];

    public constructor(position: Point = { x: 0, y: 0 }) {
        super();
        this.position = position;
    }

    public getPosition(): Point {
        return this.position;
    }

    public setPosition(position: Point): void {
        this.position = position;
        this.setPositionCalls.push(position);
    }

    public containsPoint(point: Point): boolean {
        this.containsPointCalls.push(point);
        return this.hit;
    }
}
