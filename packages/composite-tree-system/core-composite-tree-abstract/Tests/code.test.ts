// tests/main.test.ts

import { describe, expect, it } from "vitest";
import {
  CompositeNode,
  EmptyNodeIdError,
  INode,
  LeafNode,
  NodeAlreadyHasParentError,
  NodeSelfReferenceError,
  TreeCycleError,
} from "../src/index.js";

interface ITestNode extends INode<ITestNode> {}

class TestGroupNode extends CompositeNode<ITestNode> implements ITestNode {
  public constructor(id: string, initialChildren: readonly ITestNode[] = []) {
    super(id, initialChildren);
  }
}

class TestLeafNode extends LeafNode<ITestNode> implements ITestNode {
  public constructor(id: string) {
    super(id);
  }
}

class CompositeTreeTestFixture {
  public createGroup(id: string, initialChildren: readonly ITestNode[] = []): TestGroupNode {
    return new TestGroupNode(id, initialChildren);
  }

  public createLeaf(id: string): TestLeafNode {
    return new TestLeafNode(id);
  }

  public createDetachedNodes(): {
    readonly root: TestGroupNode;
    readonly group: TestGroupNode;
    readonly leaf: TestLeafNode;
    readonly otherLeaf: TestLeafNode;
  } {
    return {
      root: this.createGroup("root"),
      group: this.createGroup("group"),
      leaf: this.createLeaf("leaf"),
      otherLeaf: this.createLeaf("otherLeaf"),
    };
  }

  public createSimpleTree(): {
    readonly root: TestGroupNode;
    readonly group: TestGroupNode;
    readonly leaf: TestLeafNode;
  } {
    const { root, group, leaf } = this.createDetachedNodes();

    root.add(group);
    group.add(leaf);

    return { root, group, leaf };
  }

  public createParentWithChild(): {
    readonly parent: TestGroupNode;
    readonly child: TestLeafNode;
  } {
    const parent = this.createGroup("parent");
    const child = this.createLeaf("child");

    parent.add(child);

    return { parent, child };
  }

  public createCycleCandidateTree(): {
    readonly root: TestGroupNode;
    readonly group: TestGroupNode;
    readonly leaf: TestLeafNode;
  } {
    return this.createSimpleTree();
  }
}

describe("core-composite-tree-abstract", () => {
  describe("NodeBase", () => {
    it("should throw EmptyNodeIdError when id is empty", () => {
      const fixture = new CompositeTreeTestFixture();

      expect(() => fixture.createLeaf("")).toThrow(EmptyNodeIdError);
    });

    it("should throw EmptyNodeIdError when id is whitespace", () => {
      const fixture = new CompositeTreeTestFixture();

      expect(() => fixture.createGroup("   ")).toThrow(EmptyNodeIdError);
    });

    it("should expose null parent for a new node", () => {
      const fixture = new CompositeTreeTestFixture();
      const leaf = fixture.createLeaf("leaf");

      expect(leaf.parent).toBeNull();
    });
  });

  describe("LeafNode", () => {
    it("should expose an empty children collection", () => {
      const fixture = new CompositeTreeTestFixture();
      const leaf = fixture.createLeaf("leaf");

      expect(leaf.children).toEqual([]);
    });

    it("should keep children empty after being attached", () => {
      const fixture = new CompositeTreeTestFixture();
      const { parent, child } = fixture.createParentWithChild();

      expect(parent.children).toEqual([child]);
      expect(child.children).toEqual([]);
    });
  });

  describe("CompositeNode", () => {
    it("should add child and set parent", () => {
      const fixture = new CompositeTreeTestFixture();
      const { root, group } = fixture.createDetachedNodes();

      root.add(group);

      expect(root.children).toEqual([group]);
      expect(group.parent).toBe(root);
      expect(root.contains(group)).toBe(true);
    });

    it("should remove child and clear parent", () => {
      const fixture = new CompositeTreeTestFixture();
      const { parent, child } = fixture.createParentWithChild();

      parent.remove(child);

      expect(parent.children).toEqual([]);
      expect(child.parent).toBeNull();
      expect(parent.contains(child)).toBe(false);
    });

    it("should ignore remove when child does not exist", () => {
      const fixture = new CompositeTreeTestFixture();
      const { root, leaf } = fixture.createDetachedNodes();

      root.remove(leaf);

      expect(root.children).toEqual([]);
      expect(leaf.parent).toBeNull();
    });

    it("should add initial children through constructor", () => {
      const fixture = new CompositeTreeTestFixture();
      const leaf = fixture.createLeaf("leaf");
      const group = fixture.createGroup("group", [leaf]);

      expect(group.children).toEqual([leaf]);
      expect(leaf.parent).toBe(group);
    });

    it("should reject adding itself", () => {
      const fixture = new CompositeTreeTestFixture();
      const root = fixture.createGroup("root");

      expect(() => root.add(root)).toThrow(NodeSelfReferenceError);
    });

    it("should reject adding child that already has parent", () => {
      const fixture = new CompositeTreeTestFixture();
      const { root, group, leaf } = fixture.createDetachedNodes();

      root.add(leaf);

      expect(() => group.add(leaf)).toThrow(NodeAlreadyHasParentError);
    });

    it("should reject adding ancestor as descendant", () => {
      const fixture = new CompositeTreeTestFixture();
      const { root, group } = fixture.createCycleCandidateTree();

      expect(() => group.add(root)).toThrow(TreeCycleError);
    });

    it("should preserve insertion order of children", () => {
      const fixture = new CompositeTreeTestFixture();
      const { root, group, leaf, otherLeaf } = fixture.createDetachedNodes();

      root.add(group);
      root.add(leaf);
      root.add(otherLeaf);

      expect(root.children).toEqual([group, leaf, otherLeaf]);
    });
  });
});