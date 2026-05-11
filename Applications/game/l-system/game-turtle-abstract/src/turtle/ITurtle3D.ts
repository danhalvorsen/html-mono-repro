import type { TurtlePrimitive } from "../primitives/TurtlePrimitive.js";
import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { TurtleSnapshot } from "./TurtleSnapshot.js";

export interface ITurtle3D {
  forward(distance: number): ITurtle3D;
  move(distance: number): ITurtle3D;
  turnLeft(degrees: number): ITurtle3D;
  turnRight(degrees: number): ITurtle3D;
  pitchUp(degrees: number): ITurtle3D;
  pitchDown(degrees: number): ITurtle3D;
  rollLeft(degrees: number): ITurtle3D;
  rollRight(degrees: number): ITurtle3D;
  penUp(): ITurtle3D;
  penDown(): ITurtle3D;
  setStroke(style: StrokeStyle): ITurtle3D;
  setFill(style: FillStyle): ITurtle3D;
  pushState(): ITurtle3D;
  popState(): ITurtle3D;
  reset(): ITurtle3D;
  clear(): ITurtle3D;
  snapshot(): TurtleSnapshot;
  primitives(): readonly TurtlePrimitive[];
}