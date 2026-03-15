// code.ts
// ============================================================
// COMMON CONTRACTS
// ============================================================

export interface IPdeSnapshot<TState> {
  readonly time: number;
  readonly state: TState;
}
