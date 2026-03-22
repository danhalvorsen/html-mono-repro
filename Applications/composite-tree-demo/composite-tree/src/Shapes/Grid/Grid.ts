import { customElement, property } from 'lit/decorators.js'
import type { IStyleReference } from '@monorepo/core-style-system'
 
import { GridShape } from './GridShape'
import type { IGridShape } from './IGridShape'
import { AbstractDrawableElement } from '../ShapeElement'

@customElement('grid-primitive')
export class Grid extends AbstractDrawableElement {
  @property({ type: Number }) public width = 760
  @property({ type: Number }) public height = 520
  @property({ type: Number }) public spacing = 28
  @property({ type: Number }) public majorEvery = 5
  @property() public token = 'grid'

  override toShape(): IGridShape {
    const style: IStyleReference = { token: this.token }

    return new GridShape(
      this.width,
      this.height,
      this.spacing,
      this.majorEvery,
      style,
    )
  }
}
