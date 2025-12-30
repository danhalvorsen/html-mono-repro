// ======================================================
// Vitest tests for existing npm module
// Assumes production code is already implemented and exported
// Fixture-in-action style, no redefinition of source code
// ======================================================

import { describe, it, expect, beforeEach } from "vitest";

import {
    Turtle,
    CenteredCartesianMapper,
} from "@monorepo/core-composition-svg-turtle";
import { Point2 } from "@monorepo/core-math";
 
// ---------- Test Fixture ----------

class TurtleFixture {
    readonly turtle: Turtle;
    readonly mapper: CenteredCartesianMapper;

    constructor() {
        this.turtle = new Turtle();
        this.mapper = new CenteredCartesianMapper({
            width: 800,
            height: 600
        });
    }

    svg(p: Point2): Point2 {
        return this.mapper.toSvg(p);
    }
}

// ---------- Turtle behavior ----------

describe("Turtle – core cartesian behavior", () => {
    let fx: TurtleFixture;

    beforeEach(() => {
        fx = new TurtleFixture();
    });

    it("starts at cartesian origin with heading 0°", () => {
        expect(fx.turtle.position).toEqual({ x: 0, y: 0 });
        expect(fx.turtle.heading).toBe(0);
    });

    it("moves forward on X axis by default", () => {
        fx.turtle.forward(100);

        expect(fx.turtle.position.x).toBeCloseTo(100);
        expect(fx.turtle.position.y).toBeCloseTo(0);
    });

    it("turns and moves along Y axis", () => {
        fx.turtle.turn(90);
        fx.turtle.forward(50);

        expect(fx.turtle.position.x).toBeCloseTo(0);
        expect(fx.turtle.position.y).toBeCloseTo(50);
    });

    it("push and pop restore full turtle state", () => {
        fx.turtle.forward(100);
        fx.turtle.turn(45);
        fx.turtle.push();

        fx.turtle.forward(80);
        fx.turtle.turn(30);

        fx.turtle.pop();

        expect(fx.turtle.position).toEqual({ x: 100, y: 0 });
        expect(fx.turtle.heading).toBe(45);
    });

    it("throws when popping root state", () => {
        expect(() => fx.turtle.pop()).toThrow();
    });
});

// ---------- Cartesian → SVG mapping ----------

describe("CenteredCartesianMapper – coordinate mapping", () => {
    let fx: TurtleFixture;

    beforeEach(() => {
        fx = new TurtleFixture();
    });

    it("maps cartesian origin to SVG center", () => {
        const svg = fx.svg({ x: 0, y: 0 });

        expect(svg).toEqual({ x: 400, y: 300 });
    });

    it("inverts Y axis correctly", () => {
        const up = fx.svg({ x: 0, y: 100 });
        const down = fx.svg({ x: 0, y: -100 });

        expect(up.y).toBe(200);
        expect(down.y).toBe(400);
    });

    it("round-trips cartesian → svg → cartesian", () => {
        const original: Point2 = { x: 150, y: -75 };

        const svg = fx.mapper.toSvg(original);
        const back = fx.mapper.fromSvg(svg);

        expect(back.x).toBeCloseTo(original.x);
        expect(back.y).toBeCloseTo(original.y);
    });
});

// ---------- Integration: Turtle + Mapper ----------

describe("Turtle + Mapper integration", () => {
    let fx: TurtleFixture;

    beforeEach(() => {
        fx = new TurtleFixture();
    });

    it("produces SVG-ready points from turtle movement", () => {
        const path: Point2[] = [];

        path.push(fx.svg(fx.turtle.position));
        fx.turtle.forward(100);
        path.push(fx.svg(fx.turtle.position));
        fx.turtle.turn(90);
        fx.turtle.forward(50);
        path.push(fx.svg(fx.turtle.position));

        expect(path).toEqual([
            { x: 400, y: 300 },
            { x: 500, y: 300 },
            { x: 500, y: 250 }
        ]);
    });
});
