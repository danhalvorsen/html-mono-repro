 
import { TurtleState } from "./TurtleState.js";
import { Point } from "@monorepo/core-math";

// ---------- Turtle (Pure Cartesian, Push / Pop) ----------

export class Turtle {
    private state: TurtleState = {
        position: { x: 0, y: 0 },
        headingDeg: 0
    };

    private readonly stack: TurtleState[] = [];

    public forward(distance: number): Point {
        const rad = this.state.headingDeg * Math.PI / 180;

        const next: Point = {
            x: this.state.position.x + Math.cos(rad) * distance,
            y: this.state.position.y + Math.sin(rad) * distance
        };

        this.state = { ...this.state, position: next };
        return next;
    }

    public turn(deg: number): void {
        this.state = {
            ...this.state,
            headingDeg: this.state.headingDeg + deg
        };
    }

    public moveTo(p: Point): void {
        this.state = { ...this.state, position: p };
    }

    public push(): void {
        this.stack.push({ ...this.state });
    }

    public pop(): void {
        if (this.stack.length === 0) {
            throw new Error("Turtle stack underflow");
        }
        this.state = this.stack.pop()!;
    }

    public get position(): Point {
        return this.state.position;
    }

    public get heading(): number {
        return this.state.headingDeg;
    }
}
