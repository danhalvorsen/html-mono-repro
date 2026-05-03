import { TagSyntaxMatchesTextSpecification } from "@monorepo/core-tag-syntax-abstract";
import { LineNumberTagSyntax } from "../syntax/LineNumberTagSyntax.js";

export class LineNumberTagSpecification extends TagSyntaxMatchesTextSpecification {
  public constructor() {
    super(new LineNumberTagSyntax());
  }
}