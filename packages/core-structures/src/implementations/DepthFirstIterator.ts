import { IIterator } from '../interfaces/IIterator.js';
import { INode } from '../interfaces/INode.js';

export class DepthFirstIterator<T extends INode<any>> implements IIterator<T> {
  private stack: T[] = [];
  private readonly root: T;

  constructor(root: T) {
    this.root = root;
    this.stack.push(root);
  }

  next(): T | null {
    if (this.stack.length === 0) return null;

    const node = this.stack.pop()!;
    if (node.children?.length) {
      this.stack.push(...(node.children as T[]).slice().reverse());
    }

    return node;
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  reset(): void {
    this.stack = [this.root];
  }
}
