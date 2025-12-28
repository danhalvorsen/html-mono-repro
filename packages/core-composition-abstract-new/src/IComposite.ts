// ---------- Core Composite Contract ----------

export interface IComposite {
  readonly children: ReadonlyArray<IComposite>;
}
