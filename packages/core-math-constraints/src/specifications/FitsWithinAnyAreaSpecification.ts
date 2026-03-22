// ====================================================================================
// FILE: src/specifications/FitsWithinAnyAreaSpecification.ts
// ====================================================================================

import type { BoundingBox2D } from "@monorepo/core-math";
import { Specification } from "@monorepo/core-specifications";
import type { ISourceContext } from "../contracts/ISourceContext.js";

export class FitsWithinAnyAreaSpecification
  extends Specification<ISourceContext>
{
  private readonly areas: readonly BoundingBox2D[];

  public constructor(areas: readonly BoundingBox2D[]) {
    super();
    if (areas.length === 0) {
      throw new Error("areas must contain at least one element");
    }
    this.areas = areas;
  }

  public override isSatisfiedBy(context: ISourceContext): boolean {
    const { source } = context;

    for (const area of this.areas) {
      if (area.containsBox(source)) {
        return true;
      }
    }

    return false;
  }
}