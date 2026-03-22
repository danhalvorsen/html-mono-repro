import type { IStyleReference } from '@monorepo/core-style-system';
import { ShapeIds, StyleReferences } from '../shape-model';
import type { IGridShape } from './IGridShape';


export class GridShape implements IGridShape {
  public readonly id: string;
  public readonly kind = 'grid' as const;
  public readonly style: Readonly<IStyleReference>;

  public constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly spacing: number,
    public readonly majorEvery: number,
    style?: Readonly<IStyleReference>,
    id?: string
  ) {
    this.id = id ?? ShapeIds.create('grid');
    this.style = StyleReferences.withDefault(style, 'grid');
  }
}
