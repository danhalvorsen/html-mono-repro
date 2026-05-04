import type { ITreeNode } from "@monorepo/core-composite-tree";

export class A implements ITreeNode {
  public a(): string {
    return "A.a";
  }

  public operation(): readonly string[] {
    return [this.a()];
  }
}