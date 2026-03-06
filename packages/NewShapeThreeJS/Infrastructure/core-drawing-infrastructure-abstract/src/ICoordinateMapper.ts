/* ============================================================================
 * Coordinate mapping
 * ========================================================================== */

export interface ICoordinateMapper<TSource, TTarget> {
  map(value: TSource): TTarget;
}
