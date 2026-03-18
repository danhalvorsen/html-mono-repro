import { customElement, property } from 'lit/decorators.js'
import { AbstractDrawableElement } from '../ShapeElement'
import { CircleShape } from '../shape-model'
import type { ICircleShape } from '../shape-model'

@customElement('circle-primitive')
export class Circle extends AbstractDrawableElement {
  @property({ type: Number }) public cx = 0
  @property({ type: Number }) public cy = 0
  @property({ type: Number }) public r = 50

  override toShape(): ICircleShape {
    return new CircleShape(
      { x: this.cx, y: this.cy },
      this.r,
    )
  }
}
