import { INode } from './INode.js';

export interface IVisitor<T> {
  visit(node: INode<T>): void;
}
