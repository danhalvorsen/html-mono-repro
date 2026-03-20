
import { Specification } from "@monorepo/core-specifications";
import type { IPlacementWithSafeAreaContext } from "../contracts/IPlacementWithSafeAreaContext.js";

export class SafeAreaFitsWithinTargetSpecification
  extends Specification<IPlacementWithSafeAreaContext>
{
  public override isSatisfiedBy(context: IPlacementWithSafeAreaContext): boolean {
    return context.target.containsBox(context.safeArea);
  }
}