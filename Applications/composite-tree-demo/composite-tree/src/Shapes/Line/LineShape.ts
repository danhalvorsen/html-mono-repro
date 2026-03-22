import type { Point } from '@monorepo/core-math';
import type { IStyleReference } from '@monorepo/core-style-system';
import type { IVertex } from '../Vertex/IVertex';
import { ShapeIds, StyleReferences } from '../shape-model';
import type { ILineShape } from './ILineShape';
 
export class LineShape implements ILineShape {
  public readonly id: string;
  public readonly kind = 'line' as const;
  public readonly style: Readonly<IStyleReference>;

  public constructor(
    public readonly start: Point,
    public readonly end: Point,
    style?: Readonly<IStyleReference>,
    public readonly startVertex?: IVertex,
    public readonly endVertex?: IVertex,
    id?: string
  ) {
    this.id = id ?? ShapeIds.create('line');
    this.style = StyleReferences.withDefault(style, 'line');
  }
}
