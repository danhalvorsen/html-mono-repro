import { IDrawContext } from "./IDrawContext.js";

/* ============================================================================
 * Renderer
 * ========================================================================== */

export interface IRenderer<TDrawContext extends IDrawContext> {
  render(context: TDrawContext): void;
}
