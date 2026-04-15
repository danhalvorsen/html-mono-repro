import type {
  IQuadTreeInsertPolicy,
  IQuadTreeInsertPolicyInput,
} from '@monorepo/core-design-pattern-quad-tree-abstract';

export class DefaultInsertPolicy<TItem> implements IQuadTreeInsertPolicy<TItem> {
  public canInsert(_input: IQuadTreeInsertPolicyInput<TItem>): boolean {
    return true;
  }
}
