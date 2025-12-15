import { INode } from '../interfaces/INode.js';
import { IVisitor } from '../interfaces/IVisitor.js';

export class LoggingVisitor<T> implements IVisitor<T> {
  visit(node: INode<T>): void {
    console.log(`[Visitor] Visiting Node: ${node.data}`);
  }
}
