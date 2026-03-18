import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { AbstractDrawableElement } from '../ShapeElement'
import { createCoordinateSystem } from '../shape-model'
import type { ICoordinateSystemShape } from '../Shapes/CoordinateSystem/ICoordinateSystemShape'
import { CoordinateSystemShape } from '../Shapes/CoordinateSystem/CoordinateSystemShape'

import type { IAxis } from '../Shapes/CoordinateSystem/Axis/IAxis'
import type { IGridShape } from '../Shapes/Grid/IGridShape'
import type { DrawableShape } from '../DrawableShape'

@customElement('coordinate-system')
export class CoordinateSystem extends AbstractDrawableElement {
  @property({ type: Number }) public width = 760
  @property({ type: Number }) public height = 520
  @property({ type: Number }) public spacing = 28

  protected override createRenderRoot(): ShadowRoot {
    return this.attachShadow({ mode: 'open' })
  }

  protected override render() {
    return html`
      <slot name="grid" @slotchange=${this._notifyParent}></slot>
      <slot name="x-axis" @slotchange=${this._notifyParent}></slot>
      <slot name="y-axis" @slotchange=${this._notifyParent}></slot>
    `
  }

  override toShape(): ICoordinateSystemShape {
    const grid = this._resolveGridSlot()
    const xAxis = this._resolveAxisSlot('x-axis')
    const yAxis = this._resolveAxisSlot('y-axis')

    if (grid !== null && xAxis !== null && yAxis !== null) {
      return new CoordinateSystemShape(
        grid,
        xAxis,
        yAxis,
      )
    }

    return createCoordinateSystem(this.width, this.height, this.spacing)
  }

  private _notifyParent = (): void => {
    this.dispatchEvent(new CustomEvent('shape-changed', { bubbles: true, composed: true }))
  }

  private _resolveGridSlot(): IGridShape | null {
    const shape = this._resolveSlotShape('grid')
    return shape?.kind === 'grid' ? shape : null
  }

  private _resolveAxisSlot(slotName: 'x-axis' | 'y-axis'): IAxis | null {
    const shape = this._resolveSlotShape(slotName)
    return shape?.kind === 'axis' ? shape : null
  }

  private _resolveSlotShape(slotName: 'grid' | 'x-axis' | 'y-axis'): DrawableShape | null {
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

    return candidate.toShape()
  }
}
