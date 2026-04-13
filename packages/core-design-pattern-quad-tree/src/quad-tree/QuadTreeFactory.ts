import type {
  IQuadTreeFactory,
  ICreateQuadTreeInput,
  IQuadTree,
} from '@monorepo/core-design-pattern-quad-tree-abstract';
import { QuadTreeGuard, QuadTreeOptions } from '@monorepo/core-design-pattern-quad-tree-abstract';
import { QuadTree } from './QuadTree.js';
import { QuadTreeNode } from './QuadTreeNode.js';
import { DefaultSplitPolicy } from './policies/DefaultSplitPolicy.js';
import { DefaultInsertPolicy } from './policies/DefaultInsertPolicy.js';
import { DefaultMergePolicy } from './policies/DefaultMergePolicy.js';

export class QuadTreeFactory<TItem> implements IQuadTreeFactory<TItem> {
  public create(input: ICreateQuadTreeInput<TItem>): IQuadTree<TItem> {
    QuadTreeGuard.againstNullOrUndefined(input, 'input');
    QuadTreeGuard.againstNullOrUndefined(input.rootBounds, 'rootBounds');
    QuadTreeGuard.againstNullOrUndefined(input.boundsProvider, 'boundsProvider');
    QuadTreeGuard.againstNullOrUndefined(input.options, 'options');

    const options = new QuadTreeOptions(input.options);

    const splitPolicy =
      options.splitPolicy ?? new DefaultSplitPolicy(options.maxDepth, options.maxItemsPerNode);
    const mergePolicy =
      options.mergePolicy ?? new DefaultMergePolicy(options.maxItemsPerNode);
    const insertPolicy =
      options.insertPolicy ?? new DefaultInsertPolicy<TItem>();

    const root = new QuadTreeNode<TItem>(input.rootBounds, 0);

    return new QuadTree<TItem>(
      root,
      input.boundsProvider,
      options,
      splitPolicy,
      mergePolicy,
      insertPolicy,
    );
  }
}
