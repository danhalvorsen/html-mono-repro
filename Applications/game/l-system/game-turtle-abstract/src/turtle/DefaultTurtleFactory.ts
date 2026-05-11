import { DefaultPrimitiveFactory } from "../primitives/DefaultPrimitiveFactory.js";
import type { IPrimitiveFactory } from "../primitives/IPrimitiveFactory.js";
import { DefaultTurtle2D } from "./DefaultTurtle2D.js";
import { DefaultTurtle3D } from "./DefaultTurtle3D.js";
import type { ITurtle2D } from "./ITurtle2D.js";
import type { ITurtle3D } from "./ITurtle3D.js";

export class DefaultTurtleFactory {
  public constructor(
    private readonly primitiveFactory: IPrimitiveFactory = new DefaultPrimitiveFactory(),
  ) {}

  public create3D(): ITurtle3D {
    return new DefaultTurtle3D(this.primitiveFactory, "3d");
  }

  public create2D(): ITurtle2D {
    return new DefaultTurtle2D(new DefaultTurtle3D(this.primitiveFactory, "2d"));
  }
}