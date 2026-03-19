import { BoundingBox2D } from "@monorepo/core-math";
import { Specification } from "@monorepo/core-specifications";
export interface ISourceOnlyPlacementContext {
  readonly source: BoundingBox2D;
}

export class SourceFitsInsideFixedAreaSpecification
  extends Specification<ISourceOnlyPlacementContext>
{
  public constructor(
    private readonly area: BoundingBox2D,
  ) {
    super();
  }

  public override isSatisfiedBy(context: ISourceOnlyPlacementContext): boolean {
    return this.area.containsBox(context.source);
  }
}