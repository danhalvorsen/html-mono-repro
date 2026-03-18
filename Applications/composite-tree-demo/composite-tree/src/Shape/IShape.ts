import type { IStyleReference } from '@monorepo/core-style-system';
import type { ShapeKind } from '../shape-model';

export interface IShape {
  readonly id: string;
  readonly kind: ShapeKind;
  readonly style?: Readonly<IStyleReference>;
}
