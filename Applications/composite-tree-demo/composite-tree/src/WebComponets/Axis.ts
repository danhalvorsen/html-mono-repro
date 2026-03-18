import { customElement, property } from 'lit/decorators.js'
import type { IStyleReference } from '@monorepo/core-style-system'

import { AbstractDrawableElement } from '../ShapeElement'
 
import { LineShape } from '../Shapes/Line/LineShape'
import type { AxisName, IAxis } from '../Shapes/CoordinateSystem/Axis/IAxis'
import { AxisShape } from '../Shapes/CoordinateSystem/Axis/AxisShape'

@customElement('axis-primitive')
export class Axis extends AbstractDrawableElement {
  @property() public name: AxisName = 'x'
  @property({ type: Number }) public x1 = -100
  @property({ type: Number }) public y1 = 0
  @property({ type: Number }) public x2 = 100
  @property({ type: Number }) public y2 = 0
  @property() public token?: string

  override toShape(): IAxis {
    const axisName: AxisName = this.name === 'y' ? 'y' : 'x'
    const style: IStyleReference = {
      token: this.token ?? (axisName === 'x' ? 'axis-x' : 'axis-y'),
    }

    return new AxisShape(
      axisName,
      new LineShape(
        { x: this.x1, y: this.y1 },
        { x: this.x2, y: this.y2 },
      ),
      style,
    )
  }
}
