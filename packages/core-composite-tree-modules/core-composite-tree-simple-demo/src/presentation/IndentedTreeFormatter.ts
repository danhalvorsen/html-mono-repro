// src/presentation/IndentedTreeFormatter.ts
import { CompositeNode, type ITreeNode } from "@monorepo/core-composite-tree";
import type { ITreeFormatter } from "./ITreeFormatter.js";

export class IndentedTreeFormatter implements ITreeFormatter {
  public format(node: ITreeNode): string {
    const lines: string[] = [];
    this.visit(node, lines, 0);
    return lines.join("\n");
  }

  private visit(node: ITreeNode, lines: string[], depth: number): void {
    const indent = "  ".repeat(depth);

    if (node instanceof CompositeNode) {
      lines.push(`${indent}Composite`);

      // internal children access → keep local to formatter (adapter responsibility)
      const children = (node as unknown as { children: ITreeNode[] }).children;

      for (const child of children) {
        this.visit(child, lines, depth + 1);
      }

      return;
    }

    const values = node.operation();
    for (const v of values) {
      lines.push(`${indent}${v}`);
    }
  }
}