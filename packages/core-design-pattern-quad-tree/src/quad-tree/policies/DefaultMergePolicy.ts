import type {
  IQuadTreeMergePolicy,
  IQuadTreeMergePolicyInput,
} from '@monorepo/core-design-pattern-quad-tree-abstract';
import { QuadTreeGuard } from '@monorepo/core-design-pattern-quad-tree-abstract';

export class DefaultMergePolicy implements IQuadTreeMergePolicy {
  private readonly _maxItemsPerNode: number;

  public constructor(maxItemsPerNode: number) {
    QuadTreeGuard.againstNumberLessThanOne(maxItemsPerNode, 'maxItemsPerNode');
    this._maxItemsPerNode = maxItemsPerNode;
  }

  public shouldMerge(input: IQuadTreeMergePolicyInput): boolean {
    return (
      input.hasChildren &&
      input.itemCount <= this._maxItemsPerNode
    );
  }
}
