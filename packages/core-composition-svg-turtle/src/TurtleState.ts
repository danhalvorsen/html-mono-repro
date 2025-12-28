import { Point } from "./Turtle";

// ---------- Turtle State ----------
export interface TurtleState {
    readonly position: Point;
    readonly headingDeg: number;
}
