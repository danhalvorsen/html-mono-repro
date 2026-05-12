import type { IElementTargetMatcher } from "./IElementTargetMatcher.ts";

/**
 * Adapter matcher that delegates target validation to a supplied type guard.
 */
export class BaseGameObjectMatcher<TTarget extends Element>
  implements IElementTargetMatcher<TTarget> {
  public constructor(
    private readonly hasRequiredMembers: (element: Element) => element is TTarget,
  ) {}

  public matches(element: Element): element is TTarget {
    return this.hasRequiredMembers(element);
  }
}
