import type { Vector2 } from "@monorepo/core-math";

/* ============================================================================
 * Picking
 * ========================================================================== */

export interface IPickerService<TShape> {
  pick(point: Vector2): TShape | undefined;
}
