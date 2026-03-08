/* ============================================================
   core-composition-abstract
   Minimal, reusable Composite Tree abstraction
   ============================================================ */

import { CompositeNode } from "./CompositeNode.js";
import { INode } from "./INode.js";
import { LeafNode } from "./LeafNode.js";

/* ------------------------------------------------------------
   Traversal utility
   ------------------------------------------------------------ */

export function traverse<TNode extends INode<TNode>>(
  node: TNode,
  visitor: (node: TNode) => void
): void {
  visitor(node);

  for (const child of node.children) {
    traverse(child, visitor);
  }
}

/* ------------------------------------------------------------
   Query utilities
   ------------------------------------------------------------ */

export function findNode<TNode extends INode<TNode>>(
  root: TNode,
  predicate: (node: TNode) => boolean
): TNode | null {
  if (predicate(root)) return root;

  for (const child of root.children) {
    const result = findNode(child, predicate);
    if (result) return result;
  }

  return null;
}

export function collectNodes<TNode extends INode<TNode>>(
  root: TNode,
  predicate: (node: TNode) => boolean
): TNode[] {
  const result: TNode[] = [];

  traverse(root, (node) => {
    if (predicate(node)) result.push(node);
  });

  return result;
}

/* ------------------------------------------------------------
   Ancestor utilities
   ------------------------------------------------------------ */

export function getAncestors<TNode extends INode<TNode>>(node: TNode): TNode[] {
  const result: TNode[] = [];
  let current = node.parent;

  while (current) {
    result.push(current);
    current = current.parent;
  }

  return result;
}

/* ------------------------------------------------------------
   Example domain usage
   ------------------------------------------------------------ */

interface ITreeNode extends INode<ITreeNode> {}

class GroupNode extends CompositeNode<ITreeNode> implements ITreeNode {
  constructor(id: string, children: ITreeNode[] = []) {
    super(id, children);
  }
}

class ItemNode extends LeafNode<ITreeNode> implements ITreeNode {
  constructor(id: string) {
    super(id);
  }
}

/* Example */

const root = new GroupNode("root");
const group = new GroupNode("group");
const leaf = new ItemNode("leaf");

root.add(group);
group.add(leaf);

traverse(root, (node) => console.log(node.id));