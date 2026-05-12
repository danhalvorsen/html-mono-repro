import type { IElementTargetMatcher } from "./IElementTargetMatcher.ts";

/**
 * Validates slotted elements against a matcher and returns only typed targets.
 */
export class SlotValidator<TTarget extends Element> {
  public constructor(
    private readonly matcher: IElementTargetMatcher<TTarget>,
    private readonly errorMessage: string,
  ) {}

  public validateAndGetTargets(elements: readonly Element[]): readonly TTarget[] {
    const targets: TTarget[] = [];

    for (const element of elements) {
      if (!this.matcher.matches(element)) {
        throw new TypeError(this.errorMessage);
      }
      targets.push(element);
    }

    return targets;
  }
}
