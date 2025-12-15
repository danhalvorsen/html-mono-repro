import { IVisitor } from "core-composition-abstract/src/IVisitor.js";
import { LeafNode } from "core-composition-abstract/src/LeafNode.js";

export class TestLeaf extends LeafNode {
  accept(visitor: IVisitor): void {
    visitor.visitLeaf(this);
  }
}
