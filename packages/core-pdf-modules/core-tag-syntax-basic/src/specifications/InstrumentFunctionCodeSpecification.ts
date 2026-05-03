import { TagSyntaxGroupEqualsSpecification } from "@monorepo/core-tag-syntax-abstract";
import { InstrumentTagSyntax } from "../syntax/InstrumentTagSyntax.js";
import type { InstrumentTagGroup } from "../syntax/InstrumentTagSyntax.js";

export class InstrumentFunctionCodeSpecification
  extends TagSyntaxGroupEqualsSpecification<InstrumentTagGroup> {
  public constructor(expectedFunctionCode: string) {
    super(new InstrumentTagSyntax(), "functionCode", expectedFunctionCode);
  }
}