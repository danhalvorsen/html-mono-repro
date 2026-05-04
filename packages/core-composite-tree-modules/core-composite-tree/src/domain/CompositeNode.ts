import type { ITreeNode } from "./ITreeNode.js";

export class CompositeNode implements ITreeNode {
  private readonly children: ITreeNode[] = [];

  public add(child: ITreeNode): void {
    this.children.push(child);
  }

  public operation(): readonly string[] {
    return this.children.flatMap(c => c.operation());
  }
}