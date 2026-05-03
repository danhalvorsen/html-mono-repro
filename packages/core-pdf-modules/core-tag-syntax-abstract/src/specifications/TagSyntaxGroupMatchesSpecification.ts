import { Specification } from "@monorepo/core-specifications";
import type { ITagSyntax } from "../syntax/ITagSyntax.js";

export class TagSyntaxGroupMatchesSpecification<
  TGroup extends string = string,
> extends Specification<string> {
  public constructor(
    private readonly syntax: ITagSyntax<TGroup>,
    private readonly groupName: TGroup,
    private readonly pattern: RegExp,
  ) {
    super();

    if (pattern.global) {
      throw new Error("pattern must not use the global flag.");
    }
  }

  public override isSatisfiedBy(candidate: string): boolean {
    const result = this.syntax.parse(candidate);

    if (!result.matched) {
      return false;
    }

    const value = result.match.groups[this.groupName];

    return value !== undefined && this.pattern.test(value);
  }
}