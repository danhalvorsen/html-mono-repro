import { IComposite } from "./IComposite.js";
 
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
  render() {
    
    this.children.forEach((c: IComposite) => c.render());
  }
}
