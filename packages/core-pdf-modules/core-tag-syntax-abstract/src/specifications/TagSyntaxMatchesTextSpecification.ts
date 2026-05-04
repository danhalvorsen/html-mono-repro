import { Specification } from "@monorepo/core-specifications";
import type { ITagSyntax } from "../syntax/ITagSyntax.js";

export class TagSyntaxMatchesTextSpecification extends Specification<string> {
  public constructor(private readonly syntax: ITagSyntax) {
    super();
  }

  public override isSatisfiedBy(candidate: string): boolean {
    return this.syntax.parse(candidate).matched;
  }
}