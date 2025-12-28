import { Point } from "@monorepo/core-math";

export type Viewport = Readonly<{
    width: number;
    height: number;
}>;

export  class CenteredCartesianMapper {
    private readonly hw: number;
    private readonly hh: number;

    constructor(viewport: Viewport) {
        this.hw = viewport.width / 2;
        this.hh = viewport.height / 2;
    }

    /** Cartesian → SVG */
    toSvg(p: Point): Point {
        return {
            x: this.hw + p.x,
            y: this.hh - p.y
        };
    }

    /** SVG → Cartesian */
    fromSvg(p: Point): Point {
        return {
            x: p.x - this.hw,
            y: this.hh - p.y
        };
    }
}
