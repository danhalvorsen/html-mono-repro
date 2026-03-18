import type { IStyleReference } from '@monorepo/core-style-system';
import type { DrawableShape } from '../../DrawableShape';
import { ShapeIds, StyleReferences } from '../../shape-model';
import type { IShapeGroup } from './IShapeGroup';

export class ShapeGroup implements IShapeGroup {
  public readonly id: string;
  public readonly kind = 'group' as const;
  public readonly style: Readonly<IStyleReference>;

  public constructor(
    public readonly shapes: readonly DrawableShape[],
    style?: Readonly<IStyleReference>,
    id?: string
  ) {
    this.id = id ?? ShapeIds.create('group');
    this.style = StyleReferences.withDefault(style, 'base');
  }
}
