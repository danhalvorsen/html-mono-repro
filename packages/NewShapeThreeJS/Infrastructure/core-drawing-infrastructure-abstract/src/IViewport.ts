import type { Rectangle2 } from "@monorepo/core-math";

export interface IViewport {
  readonly size: { x: number; y: number }
  readonly bounds: Rectangle2
}