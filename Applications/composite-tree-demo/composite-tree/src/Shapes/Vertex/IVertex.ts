import type { Point } from '@monorepo/core-math';
import type { IShape } from '../../Shape/IShape';


export interface IVertex extends IShape {
  readonly kind: 'vertex';
  readonly point: Point;
  readonly marker: 'circle' | 'arrow';
  readonly size: number;
  readonly rotation?: number;
}
