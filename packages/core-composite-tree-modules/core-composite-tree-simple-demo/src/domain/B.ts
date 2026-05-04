import type { ITreeNode } from "@monorepo/core-composite-tree";

export class B implements ITreeNode {
  public b(): string {
    return "B.b";
  }

  public operation(): readonly string[] {
    return [this.b()];
  }
}