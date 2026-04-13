// Public surface — concrete implementations only.
// Contracts live in @monorepo/core-design-pattern-quad-tree-abstract.
export { QuadTree } from './quad-tree/QuadTree.js';
export { QuadTreeFactory } from './quad-tree/QuadTreeFactory.js';
export { DefaultSplitPolicy } from './quad-tree/policies/DefaultSplitPolicy.js';
export { DefaultInsertPolicy } from './quad-tree/policies/DefaultInsertPolicy.js';
export { DefaultMergePolicy } from './quad-tree/policies/DefaultMergePolicy.js';

