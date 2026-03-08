import { ICompositeNode } from "./ICompositeNode.js";
import { INode } from "./INode.js";
import { NodeBase } from "./NodeBase.js";

/* ------------------------------------------------------------
   Composite node base
   ------------------------------------------------------------ */

export abstract class CompositeNode<TNode extends INode<TNode>>
  extends NodeBase<TNode>
  implements ICompositeNode<TNode> {
  private readonly _children: TNode[] = [];

  protected constructor(id: string, initialChildren: readonly TNode[] = []) {
    super(id);

    for (const child of initialChildren) {
      this.add(child);
    }
  }

  public get children(): readonly TNode[] {
    return this._children;
  }

  public contains(child: TNode): boolean {
    return this._children.includes(child);
  }

  public add(child: TNode): void {
    if (child === (this as unknown as TNode))
      throw new Error("Cannot add node to itself.");

    if (child.parent !== null)
      throw new Error(`Child '${child.id}' already has a parent.`);

    if (this.contains(child))
      throw new Error(`Child '${child.id}' already exists.`);

    this._children.push(child);

    (child as unknown as NodeBase<TNode>).setParent(
      this as unknown as TNode
    );
  }

  public remove(child: TNode): void {
    const index = this._children.indexOf(child);
    if (index < 0) return;

    this._children.splice(index, 1);

    (child as unknown as NodeBase<TNode>).setParent(null);
  }
}
