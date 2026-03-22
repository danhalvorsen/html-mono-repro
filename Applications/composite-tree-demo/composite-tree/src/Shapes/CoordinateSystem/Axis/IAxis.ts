
import type { ILineShape } from '../../Line/ILineShape'
import type { IShape } from '../../Shape/IShape'

export type AxisName = 'x' | 'y'

export interface IAxis extends IShape {
  readonly kind: 'axis'
  readonly name: AxisName
  readonly line: ILineShape
}
