import type { IComposite } from "../../src/IComposite.js";
import type { IVisitor } from "../../src/IVisitor.js";
import { LeafNode } from "../../src/LeafNode.js";

export class TestComposite implements IComposite {
  private children: IComposite[] = [];

  add(child: IComposite): void {
    this.children.push(child);
  }

  remove(child: IComposite): void {
    this.children = this.children.filter(c => c !== child);
  }

  getChildren(): IComposite[] {
    return this.children;
  }

  accept(visitor: IVisitor): void {
    visitor.visitComposite(this);
    this.children.forEach(c => c.accept(visitor));
  }
}
 
