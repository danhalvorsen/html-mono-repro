 
import type { Point2 } from "@monorepo/core-math";
import type { TurtleState } from "./TurtleState.js";

// ---------- Turtle (Pure Cartesian, Push / Pop) ----------

export class Turtle {
    private state: TurtleState = {
        position: { x: 0, y: 0 },
        headingDeg: 0
    };

    private readonly stack: TurtleState[] = [];

    public forward(distance: number): Point2 {
        const rad = this.state.headingDeg * Math.PI / 180;

        const next: Point2 = {
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

    public moveTo(p: Point2): void {
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

    public get position(): Point2 {
        return this.state.position;
    }

    public get heading(): number {
        return this.state.headingDeg;
    }
}
