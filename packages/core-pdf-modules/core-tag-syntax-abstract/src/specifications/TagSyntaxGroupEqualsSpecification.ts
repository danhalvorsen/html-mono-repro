import { Specification } from "@monorepo/core-specifications";
import type { ITagSyntax } from "../syntax/ITagSyntax.js";

export class TagSyntaxGroupEqualsSpecification<
  TGroup extends string = string,
> extends Specification<string> {
  public constructor(
    private readonly syntax: ITagSyntax<TGroup>,
    private readonly groupName: TGroup,
    private readonly expectedValue: string,
  ) {
    super();

    if (expectedValue.trim().length === 0) {
      throw new Error("expectedValue must not be empty.");
    }
  }

  public override isSatisfiedBy(candidate: string): boolean {
    const result = this.syntax.parse(candidate);

    if (!result.matched) {
      return false;
    }

    return result.match.groups[this.groupName] === this.expectedValue;
  }
}