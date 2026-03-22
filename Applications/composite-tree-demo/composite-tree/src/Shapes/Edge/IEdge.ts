import type { IStyleReference } from '@monorepo/core-style-system';
import type { IVertex } from '../Vertex/IVertex';


export interface IEdge {
  readonly id: string;
  readonly from: IVertex;
  readonly to: IVertex;
  readonly style?: Readonly<IStyleReference>;
}
