/* ============================================================================
 * Shape collection
 * ========================================================================== */
export interface IShapeCollection<TShape> {
  add(shape: TShape): void;
  remove(shape: TShape): void;
  clear(): void;

  getShapes(): ReadonlyArray<TShape>;
}
