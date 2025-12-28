import { AnchorRef } from "./AnchorRef";
import { ConnectConstraint } from "./ConnectConstraint";

// ---------- Constraint Builder ----------

export class ConnectConstraintBuilder {
  private _pivot: "source" | "target" = "source";
  private _offset?: { x: number; y: number; };

  constructor(
    private readonly source: AnchorRef,
    private readonly target: AnchorRef
  ) { }

  withPivot(pivot: "source" | "target") {
    this._pivot = pivot;
    return this;
  }

  withOffset(x: number, y: number) {
    this._offset = { x, y };
    return this;
  }

  build(): ConnectConstraint {
    return new ConnectConstraint(
      this.source,
      this.target,
      this._pivot,
      this._offset
    );
  }
}
