import { describe, it, expect, vi } from "vitest";
import type { IComposite } from "../src/IComposite.js";
import type { IVisitor } from "../src/IVisitor.js";

import { TestLeaf } from "./TestComposite/TestComposite.js";

describe("LeafNode", () => {
  it("throws when calling add/remove", () => {
    const leaf: IComposite = new TestLeaf();

    expect(() => leaf.add({} as IComposite)).toThrowError("Leaf cannot add");
    expect(() => leaf.remove({} as IComposite)).toThrowError("Leaf cannot remove");
  });

  it("getChildren returns an empty array", () => {
    const leaf: IComposite = new TestLeaf();
    expect(leaf.getChildren()).toEqual([]);
  });

  it("calls visitLeaf on the visitor", () => {
    const visitor: IVisitor = {
      visitComposite: vi.fn(),
      visitLeaf: vi.fn(),
    };

    const leaf = new TestLeaf();
    leaf.accept(visitor);

    expect(visitor.visitLeaf).toHaveBeenCalledTimes(1);
    expect(visitor.visitLeaf).toHaveBeenCalledWith(leaf);
  });
});
