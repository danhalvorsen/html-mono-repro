// ====================================================================================
// FILE: packages/core-math-constraints/src/specifications/ObjectFitsInsideWallSpecification.ts
// ====================================================================================

import { Specification } from "@monorepo/core-specifications";
import type { IObjectPlacementContext } from "../contracts/IObjectPlacementContext.js";

export class ObjectFitsInsideWallSpecification
  extends Specification<IObjectPlacementContext>
{
  public override isSatisfiedBy(context: IObjectPlacementContext): boolean {
    return context.wallRect.containsBox(context.objectRect);
  }
}