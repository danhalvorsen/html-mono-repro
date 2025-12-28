 
import type { IVisitor } from "../src/IVisitor.ts";
import { CompositeNode } from "../src/CompositeNode.js";
import { describe, it, expect, vi } from "vitest";
 
describe("CompositeNode", () => {
  it("adds and removes children", () => {
    const root = new CompositeNode();
    const child1 = new CompositeNode();
    const child2 = new CompositeNode();

    root.add(child1);
    root.add(child2);

    expect(root.getChildren()).toEqual([child1, child2]);

    root.remove(child1);
    expect(root.getChildren()).toEqual([child2]);
  });

  it("accepts a visitor and traverses all children", () => {
    const root = new CompositeNode();
    const a = new CompositeNode();
    const b = new CompositeNode();

    root.add(a);
    root.add(b);

    const visitComposite = vi.fn();
    const visitor: IVisitor = {
      visitComposite,
      visitLeaf: vi.fn()
    };

    root.accept(visitor);

    expect(visitComposite).toHaveBeenCalledTimes(3); // root, a, b
    expect(visitComposite).toHaveBeenNthCalledWith(1, root);
    expect(visitComposite).toHaveBeenCalledWith(a);
    expect(visitComposite).toHaveBeenCalledWith(b);
  });
});
