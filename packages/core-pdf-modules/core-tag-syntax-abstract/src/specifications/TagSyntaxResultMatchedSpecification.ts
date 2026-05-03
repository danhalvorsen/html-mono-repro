import { Specification } from "@monorepo/core-specifications";
import type { TagSyntaxParseResult } from "../syntax/TagSyntaxParseResult.js";

export class TagSyntaxResultMatchedSpecification
  extends Specification<TagSyntaxParseResult> {
  public override isSatisfiedBy(candidate: TagSyntaxParseResult): boolean {
    return candidate.matched;
  }
}