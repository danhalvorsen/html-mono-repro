import { Specification } from "@monorepo/core-specifications";
import type { ISourceBoundaryPlacementContext } from "../contracts/source/ISourceBoundaryPlacementContext.js";
 
export class SourceBoundaryFitsInsideTargetSpecification
  extends Specification<ISourceBoundaryPlacementContext>
{
  public override isSatisfiedBy(context: ISourceBoundaryPlacementContext): boolean {
    const { sourceBoundary, target } = context;
    return target.containsBox(sourceBoundary);
  }
}