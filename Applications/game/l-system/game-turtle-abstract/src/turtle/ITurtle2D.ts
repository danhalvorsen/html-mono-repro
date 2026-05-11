import type { TurtlePrimitive } from "../primitives/TurtlePrimitive.js";
import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { TurtleSnapshot } from "./TurtleSnapshot.js";

export interface ITurtle2D {
  forward(distance: number): ITurtle2D;
  move(distance: number): ITurtle2D;
  turnLeft(degrees: number): ITurtle2D;
  turnRight(degrees: number): ITurtle2D;
  penUp(): ITurtle2D;
  penDown(): ITurtle2D;
  setStroke(style: StrokeStyle): ITurtle2D;
  setFill(style: FillStyle): ITurtle2D;
  pushState(): ITurtle2D;
  popState(): ITurtle2D;
  reset(): ITurtle2D;
  clear(): ITurtle2D;
  snapshot(): TurtleSnapshot;
  primitives(): readonly TurtlePrimitive[];
}