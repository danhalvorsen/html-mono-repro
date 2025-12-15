import { IIterator } from '../interfaces/IIterator.js';
import { INode } from '../interfaces/INode.js';
import { IVisitor } from '../interfaces/IVisitor.js';
import { DepthFirstIterator } from './DepthFirstIterator.js';

export class Node<T> implements INode<T> {
  data: T;
  parent: INode<T> | null = null;
  children: INode<T>[] = [];

  constructor(data: T) {
    this.data = data;
  }

  addChild(child: INode<T>): void {
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child: INode<T>): void {
    this.children = this.children.filter(c => c !== child);
    child.parent = null;
  }

  iterator(): IIterator<INode<T>> {
    return new DepthFirstIterator<INode<T>>(this);
  }

  accept(visitor: IVisitor<T>): void {
    visitor.visit(this);
    for (const child of this.children) {
      child.accept(visitor);
    }
  }
}
