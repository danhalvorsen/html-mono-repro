import { IPdeSnapshot } from "./IPdeSnapshot.js";

// ============================================================
// COMMON IMPLEMENTATIONS
// ============================================================

export class PdeSnapshot<TState> implements IPdeSnapshot<TState> {
  public constructor(
    public readonly time: number,
    public readonly state: TState
  ) { }
}
