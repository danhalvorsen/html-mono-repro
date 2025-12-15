import { IComposite } from "./IComposite.js";
import { IVisitor } from "./IVisitor.js";
export class CompositeNode implements IComposite {
  protected children: IComposite[] = [];
  add(c: IComposite) {
    this.children.push(c);
  }
  remove(c: IComposite) {
    this.children = this.children.filter((x) => x !== c);
  }
  getChildren() {
    return this.children;
  }
  accept(v: IVisitor) {
    v.visitComposite(this);
    this.children.forEach((c) => c.accept(v));
  }
}
