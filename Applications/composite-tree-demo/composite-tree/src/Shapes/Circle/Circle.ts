import { customElement, property } from 'lit/decorators.js'
import { type ICircleShape, CircleShape } from '../shape-model'
import { AbstractDrawableElement } from '../ShapeElement'
 
@customElement('circle-primitive')
export class Circle extends AbstractDrawableElement {
  @property({ type: Number }) public cx = 0
  @property({ type: Number }) public cy = 0
  @property({ type: Number }) public r = 50

  toShape(): ICircleShape {
    return new CircleShape(
      { x: this.cx, y: this.cy },
      this.r,
    )
  }
}
