import { Specification } from "@monorepo/core-specifications";
import type { TagSyntaxParseResult } from "../syntax/TagSyntaxParseResult.js";

export class TagSyntaxResultSyntaxIdSpecification
  extends Specification<TagSyntaxParseResult> {
  public constructor(private readonly expectedSyntaxId: string) {
    super();

    if (expectedSyntaxId.trim().length === 0) {
      throw new Error("expectedSyntaxId must not be empty.");
    }
  }

  public override isSatisfiedBy(candidate: TagSyntaxParseResult): boolean {
    if (candidate.matched) {
      return candidate.match.syntaxId === this.expectedSyntaxId;
    }

    return candidate.syntaxId === this.expectedSyntaxId;
  }
}