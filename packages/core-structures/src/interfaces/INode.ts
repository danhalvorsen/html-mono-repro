import { IIterator } from './IIterator.js';
import { IVisitor } from './IVisitor.js';

export interface INode<T> {
  data: T;
  parent: INode<T> | null;
  children: INode<T>[];

  addChild(child: INode<T>): void;
  removeChild(child: INode<T>): void;
  iterator(): IIterator<INode<T>>; // Use IIterator for traversal
  accept(visitor: IVisitor<T>): void; // Support visitor pattern
}
