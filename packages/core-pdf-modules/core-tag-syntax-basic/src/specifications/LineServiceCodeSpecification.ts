import { TagSyntaxGroupEqualsSpecification } from "@monorepo/core-tag-syntax-abstract";
import { LineNumberTagSyntax } from "../syntax/LineNumberTagSyntax.js";
import type { LineNumberTagGroup } from "../syntax/LineNumberTagSyntax.js";

export class LineServiceCodeSpecification
  extends TagSyntaxGroupEqualsSpecification<LineNumberTagGroup> {
  public constructor(expectedServiceCode: string) {
    super(new LineNumberTagSyntax(), "service", expectedServiceCode);
  }
}