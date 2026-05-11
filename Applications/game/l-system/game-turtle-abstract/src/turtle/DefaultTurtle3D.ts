import { InvalidPrimitiveParameterError } from "../errors/InvalidPrimitiveParameterError.js";
import { InvalidRotationError } from "../errors/InvalidRotationError.js";
import { PopEmptyStackError } from "../errors/PopEmptyStackError.js";
import { DefaultTurtleVectorMath } from "../math/DefaultTurtleVectorMath.js";
import type { ITurtleVectorMath } from "../math/ITurtleVectorMath.js";
import type { IPrimitiveFactory } from "../primitives/IPrimitiveFactory.js";
import type { PrimitiveMetadata } from "../primitives/PrimitiveMetadata.js";
import { PrimitiveValueCopier } from "../primitives/PrimitiveValueCopier.js";
import type { TurtlePrimitive } from "../primitives/TurtlePrimitive.js";
import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type { ITurtle3D } from "./ITurtle3D.js";
import type { TurtleMode } from "./TurtleMode.js";
import { TurtleStateFactory } from "./TurtleStateFactory.js";
import type { TurtleSnapshot, TurtleState } from "./TurtleSnapshot.js";

export class DefaultTurtle3D implements ITurtle3D {
  private state: TurtleState;
  private readonly stateStack: TurtleState[];
  private readonly emittedPrimitives: TurtlePrimitive[];

  public constructor(
    private readonly primitiveFactory: IPrimitiveFactory,
    private readonly mode: TurtleMode = "3d",
    private readonly vectorMath: ITurtleVectorMath = new DefaultTurtleVectorMath(),
    private readonly stateFactory: TurtleStateFactory = new TurtleStateFactory(),
    private readonly copier: PrimitiveValueCopier = new PrimitiveValueCopier(),
  ) {
    this.state = this.stateFactory.createDefault(mode);
    this.stateStack = [];
    this.emittedPrimitives = [];
  }

  public forward(distance: number): ITurtle3D {
    this.assertFinite(distance, "distance");

    const from = this.state.position;
    const to = this.vectorMath.add(from, this.vectorMath.scale(this.state.forward, distance));

    if (this.state.isPenDown) {
      this.emittedPrimitives.push(
        this.primitiveFactory.createLine({
          from,
          to,
          stroke: this.state.stroke,
          ...(this.state.metadata === undefined ? {} : { metadata: this.state.metadata }),
        }),
      );
    }

    this.state = Object.freeze({
      ...this.state,
      position: this.vectorMath.copyVector(to),
    });

    return this;
  }

  public move(distance: number): ITurtle3D {
    return this.forward(distance);
  }

  public turnLeft(degrees: number): ITurtle3D {
    return this.rotateYaw(degrees);
  }

  public turnRight(degrees: number): ITurtle3D {
    return this.rotateYaw(-degrees);
  }

  public pitchUp(degrees: number): ITurtle3D {
    return this.rotatePitch(-degrees);
  }

  public pitchDown(degrees: number): ITurtle3D {
    return this.rotatePitch(degrees);
  }

  public rollLeft(degrees: number): ITurtle3D {
    return this.rotateRoll(degrees);
  }

  public rollRight(degrees: number): ITurtle3D {
    return this.rotateRoll(-degrees);
  }

  public penUp(): ITurtle3D {
    this.state = Object.freeze({
      ...this.state,
      isPenDown: false,
    });

    return this;
  }

  public penDown(): ITurtle3D {
    this.state = Object.freeze({
      ...this.state,
      isPenDown: true,
    });

    return this;
  }

  public setStroke(style: StrokeStyle): ITurtle3D {
    if (!Number.isFinite(style.width) || style.width <= 0) {
      throw new InvalidPrimitiveParameterError("Stroke width must be greater than zero.");
    }

    this.state = Object.freeze({
      ...this.state,
      stroke: this.copier.copyStroke(style),
    });

    return this;
  }

  public setFill(style: FillStyle): ITurtle3D {
    this.state = Object.freeze({
      ...this.state,
      fill: this.copier.copyFill(style),
    });

    return this;
  }

  public pushState(): ITurtle3D {
    this.stateStack.push(this.stateFactory.copy(this.state));
    return this;
  }

  public popState(): ITurtle3D {
    const restoredState = this.stateStack.pop();

    if (restoredState === undefined) {
      throw new PopEmptyStackError();
    }

    this.state = this.stateFactory.copy(restoredState);
    return this;
  }

  public reset(): ITurtle3D {
    this.state = this.stateFactory.createDefault(this.mode);
    this.stateStack.length = 0;
    this.emittedPrimitives.length = 0;
    return this;
  }

  public clear(): ITurtle3D {
    this.emittedPrimitives.length = 0;
    return this;
  }

  public snapshot(): TurtleSnapshot {
    return this.stateFactory.copy(this.state);
  }

  public primitives(): readonly TurtlePrimitive[] {
    return [...this.emittedPrimitives];
  }

  private rotateYaw(degrees: number): ITurtle3D {
    this.assertRotation(degrees);

    const forward = this.vectorMath.rotateAroundAxis(this.state.forward, this.state.up, degrees);
    const left = this.vectorMath.rotateAroundAxis(this.state.left, this.state.up, degrees);

    this.setOrientation(forward, left, this.state.up);

    return this;
  }

  private rotatePitch(degrees: number): ITurtle3D {
    this.assertRotation(degrees);

    const forward = this.vectorMath.rotateAroundAxis(this.state.forward, this.state.left, degrees);
    const up = this.vectorMath.rotateAroundAxis(this.state.up, this.state.left, degrees);

    this.setOrientation(forward, this.state.left, up);

    return this;
  }

  private rotateRoll(degrees: number): ITurtle3D {
    this.assertRotation(degrees);

    const left = this.vectorMath.rotateAroundAxis(this.state.left, this.state.forward, degrees);
    const up = this.vectorMath.rotateAroundAxis(this.state.up, this.state.forward, degrees);

    this.setOrientation(this.state.forward, left, up);

    return this;
  }

  private setOrientation(forwardInput: Vector3, leftInput: Vector3, upInput: Vector3): void {
    const forward = this.vectorMath.normalize(forwardInput);

    const upCandidate = this.vectorMath.normalize(upInput);
    const leftFromBasis = this.vectorMath.cross(upCandidate, forward);

    if (this.vectorMath.length(leftFromBasis) === 0) {
      throw new InvalidRotationError("Invalid turtle orientation basis.");
    }

    const left = this.vectorMath.normalize(leftFromBasis);
    const up = this.vectorMath.normalize(this.vectorMath.cross(forward, left));

    void leftInput;

    this.state = Object.freeze({
      ...this.state,
      forward,
      left,
      up,
    });
  }

  private assertFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new InvalidPrimitiveParameterError(`${name} must be finite.`);
    }
  }

  private assertRotation(degrees: number): void {
    if (!Number.isFinite(degrees)) {
      throw new InvalidRotationError("Rotation degrees must be finite.");
    }
  }
}