import { IComposite } from "./IComposite.js";
 
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
  abstract render(): void;
}
