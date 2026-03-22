import { customElement, property } from 'lit/decorators.js'
import type { IStyleReference } from '@monorepo/core-style-system'
import { VertexShape } from '../shape-model'
 
import type { IVertex } from './IVertex'
import { AbstractDrawableElement } from '../ShapeElement'
 
@customElement('vertex-primitive')
export class Vertex extends AbstractDrawableElement {
  @property({ type: Number }) public x = 0
  @property({ type: Number }) public y = 0
  @property({ type: Number }) public size = 6
  @property() public marker: 'circle' | 'arrow' = 'circle'
  @property({ type: Number }) public rotation = 0
  @property() public token = 'vertex'

  override toShape(): IVertex {
    const style: IStyleReference = { token: this.token }

    return new VertexShape(
      { x: this.x, y: this.y },
      this.marker,
      this.size,
      this.rotation,
      style,
    )
  }
}
