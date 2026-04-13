import type {
  IQuadTreeSplitPolicy,
  IQuadTreeSplitPolicyInput,
} from '@monorepo/core-design-pattern-quad-tree-abstract';
import { QuadTreeGuard } from '@monorepo/core-design-pattern-quad-tree-abstract';

export class DefaultSplitPolicy implements IQuadTreeSplitPolicy {
  private readonly _maxDepth: number;
  private readonly _maxItemsPerNode: number;

  public constructor(maxDepth: number, maxItemsPerNode: number) {
    QuadTreeGuard.againstNegativeNumber(maxDepth, 'maxDepth');
    QuadTreeGuard.againstNumberLessThanOne(maxItemsPerNode, 'maxItemsPerNode');
    this._maxDepth = maxDepth;
    this._maxItemsPerNode = maxItemsPerNode;
  }

  public shouldSplit(input: IQuadTreeSplitPolicyInput): boolean {
    return (
      !input.hasChildren &&
      input.itemCount > this._maxItemsPerNode &&
      input.depth < this._maxDepth &&
      input.nodeBounds.width > 0 &&
      input.nodeBounds.height > 0
    );
  }
}
