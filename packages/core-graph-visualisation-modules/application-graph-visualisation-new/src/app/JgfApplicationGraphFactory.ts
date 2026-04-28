// JgfApplicationGraphFactory: creates an IGraph from JGF input
// import { JgfDocument } from '../jgf/JgfGraphDocument';
// import { JgfToGraphAdapter } from '../jgf/JgfToGraphAdapter';
// import { IGraph } from '@monorepo/core-graph';

import type { JgfDocument } from '../jgf/JgfGraphDocument';
import type { IGraph } from '@monorepo/core-graph';
import { JgfToGraphAdapter } from '../jgf/JgfToGraphAdapter';

export class JgfApplicationGraphFactory {
  static fromJgf(jgfDoc: JgfDocument): IGraph {
    return JgfToGraphAdapter.toGraph(jgfDoc);
  }
}
