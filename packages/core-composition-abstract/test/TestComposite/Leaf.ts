import type { IVisitor } from "../../src/IVisitor.ts";
import { LeafNode } from "../../src/LeafNode.ts";

export class TestLeaf extends LeafNode {
  accept(visitor: IVisitor): void {
    visitor.visitLeaf(this);
  }
}
