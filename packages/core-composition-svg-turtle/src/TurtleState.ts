import { Point2 } from "@monorepo/core-math";

// ---------- Turtle State ----------
export interface TurtleState {
    readonly position: Point2;
    readonly headingDeg: number;
}
