// src/presentation/ITreeFormatter.ts
import type { ITreeNode } from "@monorepo/core-composite-tree";

export interface ITreeFormatter {
  format(node: ITreeNode): string;
}