import type { ITreeNode } from "@monorepo/core-composite-tree";

export class C implements ITreeNode {
  public c(): string {
    return "X.c";
  }

  public operation(): readonly string[] {
    return [this.c()];
  }
}