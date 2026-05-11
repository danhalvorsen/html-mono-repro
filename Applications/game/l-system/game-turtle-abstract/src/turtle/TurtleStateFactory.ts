import { PrimitiveValueCopier } from "../primitives/PrimitiveValueCopier.js";
import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { TurtleMode } from "./TurtleMode.js";
import type { TurtleState } from "./TurtleSnapshot.js";

export class TurtleStateFactory {
  private readonly copier: PrimitiveValueCopier;

  public constructor(copier: PrimitiveValueCopier = new PrimitiveValueCopier()) {
    this.copier = copier;
  }

  public createDefault(mode: TurtleMode): TurtleState {
    return Object.freeze({
      position: Object.freeze({ x: 0, y: 0, z: 0 }),
      forward: Object.freeze({ x: 1, y: 0, z: 0 }),
      left: Object.freeze({ x: 0, y: 1, z: 0 }),
      up: Object.freeze({ x: 0, y: 0, z: 1 }),
      isPenDown: true,
      mode,
      stroke: Object.freeze({ color: "#000000", width: 1 }),
    });
  }

  public copy(state: TurtleState): TurtleState {
    return Object.freeze({
      position: this.copier.copyVector(state.position),
      forward: this.copier.copyVector(state.forward),
      left: this.copier.copyVector(state.left),
      up: this.copier.copyVector(state.up),
      isPenDown: state.isPenDown,
      mode: state.mode,
      stroke: this.copyStroke(state.stroke),
      ...(state.fill === undefined ? {} : { fill: this.copyFill(state.fill) }),
      ...(state.metadata === undefined ? {} : { metadata: this.copier.copyMetadata(state.metadata) }),
    });
  }

  private copyStroke(stroke: StrokeStyle): StrokeStyle {
    return Object.freeze({
      color: stroke.color,
      width: stroke.width,
    });
  }

  private copyFill(fill: FillStyle): FillStyle {
    return Object.freeze({
      color: fill.color,
    });
  }
}