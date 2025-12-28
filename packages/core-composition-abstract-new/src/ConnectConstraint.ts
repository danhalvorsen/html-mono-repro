import { AnchorRef } from "./AnchorRef";
import { Constraint } from "./Constraint";

// ---------- Connect (Coincident) Constraint ----------

export class ConnectConstraint implements Constraint {
  readonly kind = "connect";

  constructor(
    public readonly source: AnchorRef,
    public readonly target: AnchorRef,
    public readonly pivot: "source" | "target" = "source",
    public readonly offset?: { x: number; y: number; }
  ) { }
}
