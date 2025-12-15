// File: tests/Node.test.ts
import { describe, it, expect } from 'vitest';
import { Node } from '../src/index.js';

describe('Node<T>', () => {
  it('should initialize with data', () => {
    const node = new Node('RootNode');
    expect(node.data).toBe('RootNode');
  });

  it('should add and remove child nodes', () => {
    const root = new Node('Root');
    const child = new Node('Child');

    root.addChild(child);

    expect(root.children.length).toBe(1);
    expect(root.children[0]).toBe(child);
    expect(child.parent).toBe(root);

    root.removeChild(child);

    expect(root.children.length).toBe(0);
    expect(child.parent).toBeNull();
  });

  it('should allow nested children', () => {
    const root = new Node('Root');
    const child1 = new Node('Child 1');
    const child2 = new Node('Child 2');
    const grandchild = new Node('Grandchild');

    root.addChild(child1);
    root.addChild(child2);
    child1.addChild(grandchild);

    expect(root.children).toContain(child1);
    expect(root.children).toContain(child2);
    expect(child1.children).toContain(grandchild);
  });
});
