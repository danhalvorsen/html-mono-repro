import type { IStyleReference } from '@monorepo/core-style-system'
 
import type { AxisName, IAxis } from './IAxis'
import type { ILineShape } from '../../Line/ILineShape'
import { ShapeIds, StyleReferences } from '../../../shape-model'

export class AxisShape implements IAxis {
  public readonly id: string
  public readonly kind = 'axis' as const
  public readonly style: Readonly<IStyleReference>

  public constructor(
    public readonly name: AxisName,
    public readonly line: ILineShape,
    style?: Readonly<IStyleReference>,
    id?: string,
  ) {
    this.id = id ?? ShapeIds.create('axis')
    this.style = StyleReferences.withDefault(style, name === 'x' ? 'axis-x' : 'axis-y')
  }
}
