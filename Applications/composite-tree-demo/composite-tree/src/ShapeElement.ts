import { LitElement, nothing } from 'lit'
import type { DrawableShape } from './DrawableShape'

/**
 * Abstract base for all drawable web components.
 * Data-holder only — no shadow DOM, no visual output.
 * The canvas reads toShape() from slotted instances.
 */
export abstract class AbstractDrawableElement extends LitElement {
  abstract toShape(): DrawableShape

  protected override createRenderRoot(): HTMLElement | ShadowRoot { return this }

  protected override render(): unknown { return nothing }

  protected override updated(): void {
    this.dispatchEvent(new CustomEvent('shape-changed', { bubbles: true, composed: true }))
  }
}

/**
 * Backward-compatible alias.
 * Prefer AbstractDrawableElement for new code.
 */
export abstract class AbstractShapeElement extends AbstractDrawableElement {}
