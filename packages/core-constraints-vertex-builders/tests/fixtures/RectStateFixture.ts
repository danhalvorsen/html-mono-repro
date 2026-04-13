import { RectSemantic } from "../../src/RectSemantic.js";
import { RectState } from "../../src/RectState.js";
import type { RectSemanticPoint } from "../../src/RectSemanticPoint.js";

export class RectStateFixture {
  public createDefault(): RectState {
    return RectState.create({ width: 2, height: 4, depth: 1 });
  }

  public createAt(
    x: number,
    y: number,
    z: number,
    rotationDegrees: number = 0,
    pivot: RectSemanticPoint | undefined = undefined,
  ): RectState {
    return new RectState(x, y, z, { width: 2, height: 4, depth: 1 }, rotationDegrees, pivot);
  }

  public createRotated(): RectState {
    return this.createAt(5, 10, 0, 90, RectSemantic.Top.Left);
  }
}
