import { AnchorRef } from "./AnchorRef";
import { ConnectConstraintBuilder } from "./ConnectConstraintBuilder";

// ---------- Fluent Anchor Expression ----------

export class AnchorExpression {
  constructor(private readonly source: AnchorRef) { }

  connectTo(target: AnchorRef) {
    return new ConnectConstraintBuilder(this.source, target);
  }
}
