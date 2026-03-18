import { property } from 'lit/decorators.js'
import { customElement } from 'lit/decorators.js'
import { ShapeElement } from './ShapeElement'
import { createCoordinateSystem } from './shape-model'
import type { ICoordinateSystemShape } from './ICoordinateSystemShape'

@customElement('coordinate-system')
export class CoordinateSystemElement extends ShapeElement {
  @property({ type: Number }) public width = 760
  @property({ type: Number }) public height = 520
  @property({ type: Number }) public spacing = 28

  override toShape(): ICoordinateSystemShape {
    return createCoordinateSystem(this.width, this.height, this.spacing)
  }
}
