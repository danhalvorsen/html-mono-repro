
import { Specification } from "@monorepo/core-specifications";
import type { IPlacementContext } from "../contracts/IPlacementContext.js";

export class FitsWithinTargetSpecification
  extends Specification<IPlacementContext>
{
  public override isSatisfiedBy(context: IPlacementContext): boolean {
    return context.target.containsBox(context.source);
  }
}