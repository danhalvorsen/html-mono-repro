import { TagSyntaxMatchesTextSpecification } from "@monorepo/core-tag-syntax-abstract";
import { InstrumentTagSyntax } from "../syntax/InstrumentTagSyntax.js";

export class InstrumentTagSpecification extends TagSyntaxMatchesTextSpecification {
  public constructor() {
    super(new InstrumentTagSyntax());
  }
}