// ====================================================================================
// FILE: specifications/FitsWithinFixedAreaSpecification.ts
// ====================================================================================

import type { BoundingBox2D } from "@monorepo/core-math";
import { Specification } from "@monorepo/core-specifications";

export interface ISourceContext {
  readonly source: BoundingBox2D;
}

export class FitsWithinFixedAreaSpecification
  extends Specification<ISourceContext>
{
  public constructor(private readonly area: BoundingBox2D) {
    super();
  }

  public override isSatisfiedBy(context: ISourceContext): boolean {
    return this.area.containsBox(context.source);
  }
}