 
import { BoxCompositionRoot, type IBox2 } from "@monorepo/core-math-rectangle";
import {
  type IRectangleKind,
} from "../src/index.js";

export class RectangleKindFixture implements IRectangleKind {
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }
}

declare module "@monorepo/core-math-rectangle" {
  interface BoxCompositionRoot {
    createAabb2FromMinMax(
      minX: number,
      minY: number,
      maxX: number,
      maxY: number,
    ): IBox2;
  }
}

BoxCompositionRoot.prototype.createAabb2FromMinMax = function createAabb2FromMinMax(
  this: BoxCompositionRoot,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): IBox2 {
  const boxModule = new BoxCompositionRoot();

  return boxModule.createAabb2(
    { x: minX, y: minY, clone() { return this; } } as never,
    { x: maxX, y: maxY, clone() { return this; } } as never,
  );
};
