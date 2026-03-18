import { LitElement, nothing } from 'lit'
import type { DrawableShape } from './DrawableShape'

/**
 * Abstract base for all shape web components.
 * Data-holder only — no shadow DOM, no visual output.
 * The canvas reads toShape() from slotted instances.
 */
export abstract class ShapeElement extends LitElement {
  abstract toShape(): DrawableShape

  protected override createRenderRoot(): HTMLElement { return this }

  protected override render() { return nothing }

  protected override updated(): void {
    this.dispatchEvent(new CustomEvent('shape-changed', { bubbles: true, composed: true }))
  }
}
