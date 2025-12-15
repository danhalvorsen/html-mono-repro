import { IComposite } from "./IComposite.js";
import { IVisitor } from "./IVisitor.js";

/**
 * Base class for a leaf in the composite pattern.
 * Leaves cannot add or remove children and always report no children.
 */
export abstract class LeafNode implements IComposite {
  add(_child: IComposite): void {
    throw new Error("Leaf cannot add");
  }
  remove(_child: IComposite): void {
    throw new Error("Leaf cannot remove");
  }
  getChildren(): IComposite[] {
    return [];
  }
  abstract accept(visitor: IVisitor): void;
}
