import { customElement, property } from 'lit/decorators.js'
import type { IStyleReference } from '@monorepo/core-style-system'
import { AbstractDrawableElement } from '../../ShapeElement'
import { RectangleShape } from '../../shape-model'
import type { IPolygon } from '../Polygon/IPolygon'

@customElement('rectangle-primitive')
export class Rectangle extends AbstractDrawableElement {
  @property({ type: Number }) public cx = 0
  @property({ type: Number }) public cy = 0
  @property({ type: Number }) public width = 120
  @property({ type: Number }) public height = 80
  @property() public token = 'rectangle'

  override toShape(): IPolygon {
    const style: IStyleReference = { token: this.token }

    return new RectangleShape(
      { x: this.cx, y: this.cy },
      this.width,
      this.height,
      style,
    )
  }
}
