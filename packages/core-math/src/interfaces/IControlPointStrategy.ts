export interface IControlPointStrategy<T> {
  /**
   * Estimate a tangent or control vector at the given index.
   * @param points The full list of points.
   * @param index The index of the point whose control should be estimated.
   */
  estimate(points: T[], index: number): T;
}
