import type { TurtlePrimitive } from "../primitives/TurtlePrimitive.js";
import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { ITurtle2D } from "./ITurtle2D.js";
import type { ITurtle3D } from "./ITurtle3D.js";
import type { TurtleSnapshot } from "./TurtleSnapshot.js";

export class DefaultTurtle2D implements ITurtle2D {
  public constructor(private readonly turtle: ITurtle3D) {}

  public forward(distance: number): ITurtle2D {
    this.turtle.forward(distance);
    return this;
  }

  public move(distance: number): ITurtle2D {
    return this.forward(distance);
  }

  public turnLeft(degrees: number): ITurtle2D {
    this.turtle.turnLeft(degrees);
    return this;
  }

  public turnRight(degrees: number): ITurtle2D {
    this.turtle.turnRight(degrees);
    return this;
  }

  public penUp(): ITurtle2D {
    this.turtle.penUp();
    return this;
  }

  public penDown(): ITurtle2D {
    this.turtle.penDown();
    return this;
  }

  public setStroke(style: StrokeStyle): ITurtle2D {
    this.turtle.setStroke(style);
    return this;
  }

  public setFill(style: FillStyle): ITurtle2D {
    this.turtle.setFill(style);
    return this;
  }

  public pushState(): ITurtle2D {
    this.turtle.pushState();
    return this;
  }

  public popState(): ITurtle2D {
    this.turtle.popState();
    return this;
  }

  public reset(): ITurtle2D {
    this.turtle.reset();
    return this;
  }

  public clear(): ITurtle2D {
    this.turtle.clear();
    return this;
  }

  public snapshot(): TurtleSnapshot {
    return this.turtle.snapshot();
  }

  public primitives(): readonly TurtlePrimitive[] {
    return this.turtle.primitives();
  }
}