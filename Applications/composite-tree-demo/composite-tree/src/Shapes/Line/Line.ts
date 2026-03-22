import { html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Point } from '@monorepo/core-math'
import type { IStyleReference } from '@monorepo/core-style-system'
import { AbstractDrawableElement } from  '../ShapeElement'  
import type { DrawableShape } from '../../DrawableShape'
import { LineShape } from './LineShape'
import type { ILineShape } from './ILineShape'
import type { IVertex } from '../Vertex/IVertex'

@customElement('line-primitive')
export class Line extends AbstractDrawableElement {
  @property({ type: Number }) public x1 = 0
  @property({ type: Number }) public y1 = 0
  @property({ type: Number }) public x2 = 120
  @property({ type: Number }) public y2 = 0
  @property() public token = 'line-element'

  protected override createRenderRoot(): ShadowRoot {
    return this.attachShadow({ mode: 'open' })
  }

  protected override render() {
    return html`
      <slot name="p0" @slotchange=${this._notifyParent}></slot>
      <slot name="p1" @slotchange=${this._notifyParent}></slot>
      ${nothing}
    `
  }

  override toShape(): ILineShape {
    const p0 = this._resolveVertexFromSlot('p0')
    const p1 = this._resolveVertexFromSlot('p1')
    const start = { x: this.x1, y: this.y1 }
    const end = { x: this.x2, y: this.y2 }

    const style: IStyleReference = { token: this.token }

    return new LineShape(
      start,
      end,
      style,
      p0 ? this._withPoint(p0, start) : undefined,
      p1 ? this._withPoint(p1, end) : undefined,
    )
  }

  private _notifyParent = (): void => {
    this.dispatchEvent(new CustomEvent('shape-changed', { bubbles: true, composed: true }))
  }

  private _resolveVertexFromSlot(slotName: 'p0' | 'p1'): IVertex | null {
    const slot = this.shadowRoot?.querySelector(`slot[name="${slotName}"]`)

    if (!(slot instanceof HTMLSlotElement)) {
      return null
    }

    const candidate = slot
      .assignedElements({ flatten: true })
      .find((el): el is AbstractDrawableElement => el instanceof AbstractDrawableElement)

    if (candidate === undefined) {
      return null
    }

    const shape = candidate.toShape() as DrawableShape

    return shape.kind === 'vertex' ? shape : null
  }

  private _withPoint(
    vertex: IVertex,
    point: Point,
  ): IVertex {
    return {
      ...vertex,
      point,
    }
  }
}
