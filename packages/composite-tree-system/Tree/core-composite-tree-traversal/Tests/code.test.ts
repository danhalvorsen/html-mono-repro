
/* ============================================================================
   tests/main.test.ts
   ============================================================================ */
import { describe, expect, it } from "vitest";
import { CompositeNode, INode, LeafNode } from '@monorepo/core-composite-tree-abstract';
import {
  BreadthFirstTraversalStrategy,
  CollectVisitor,
  DepthFirstTraversalStrategy,
  FindFirstVisitor,
  RecordingVisitor,
  TreeWalker,
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

class TraversalTestFixture {
  public createGroup(
    id: string,
    children: readonly ITestNode[] = []
  ): TestGroupNode {
    return new TestGroupNode(id, children);
  }

  public createLeaf(id: string): TestLeafNode {
    return new TestLeafNode(id);
  }

  public createTree(): {
    readonly root: TestGroupNode;
    readonly groupA: TestGroupNode;
    readonly groupB: TestGroupNode;
    readonly leafA1: TestLeafNode;
    readonly leafB1: TestLeafNode;
  } {
    const root = this.createGroup("root");
    const groupA = this.createGroup("groupA");
    const groupB = this.createGroup("groupB");
    const leafA1 = this.createLeaf("leafA1");
    const leafB1 = this.createLeaf("leafB1");

    root.add(groupA);
    root.add(groupB);
    groupA.add(leafA1);
    groupB.add(leafB1);

    return { root, groupA, groupB, leafA1, leafB1 };
  }
}

describe("core-composite-tree-traversal", () => {
  describe("TreeWalker", () => {
    it("should delegate traversal to the configured strategy", () => {
      const fixture = new TraversalTestFixture();
      const { root } = fixture.createTree();

      const walker = new TreeWalker<ITestNode>(
        new DepthFirstTraversalStrategy<ITestNode>()
      );
      const visitor = new RecordingVisitor<ITestNode>();

      walker.walk(root, visitor);

      expect(visitor.entered.map((node) => node.id)).toEqual([
        "root",
        "groupA",
        "leafA1",
        "groupB",
        "leafB1",
      ]);
    });
  });

  describe("DepthFirstTraversalStrategy", () => {
    it("should traverse in depth-first pre-order", () => {
      const fixture = new TraversalTestFixture();
      const { root } = fixture.createTree();

      const strategy = new DepthFirstTraversalStrategy<ITestNode>();
      const visitor = new RecordingVisitor<ITestNode>();

      strategy.traverse(root, visitor);

      expect(visitor.entered.map((node) => node.id)).toEqual([
        "root",
        "groupA",
        "leafA1",
        "groupB",
        "leafB1",
      ]);

      expect(visitor.left.map((node) => node.id)).toEqual([
        "leafA1",
        "groupA",
        "leafB1",
        "groupB",
        "root",
      ]);
    });
  });

  describe("BreadthFirstTraversalStrategy", () => {
    it("should traverse in breadth-first order", () => {
      const fixture = new TraversalTestFixture();
      const { root } = fixture.createTree();

      const strategy = new BreadthFirstTraversalStrategy<ITestNode>();
      const visitor = new RecordingVisitor<ITestNode>();

      strategy.traverse(root, visitor);

      expect(visitor.entered.map((node) => node.id)).toEqual([
        "root",
        "groupA",
        "groupB",
        "leafA1",
        "leafB1",
      ]);

      expect(visitor.left.map((node) => node.id)).toEqual([
        "root",
        "groupA",
        "groupB",
        "leafA1",
        "leafB1",
      ]);
    });
  });

  describe("FindFirstVisitor", () => {
    it("should return the first matching node", () => {
      const fixture = new TraversalTestFixture();
      const { root, leafB1 } = fixture.createTree();

      const walker = new TreeWalker<ITestNode>(
        new DepthFirstTraversalStrategy<ITestNode>()
      );
      const visitor = new FindFirstVisitor<ITestNode>(
        (node) => node.id === "leafB1"
      );

      walker.walk(root, visitor);

      expect(visitor.result).toBe(leafB1);
    });

    it("should return null when no node matches", () => {
      const fixture = new TraversalTestFixture();
      const { root } = fixture.createTree();

      const walker = new TreeWalker<ITestNode>(
        new DepthFirstTraversalStrategy<ITestNode>()
      );
      const visitor = new FindFirstVisitor<ITestNode>(
        (node) => node.id === "missing"
      );

      walker.walk(root, visitor);

      expect(visitor.result).toBeNull();
    });
  });

  describe("CollectVisitor", () => {
    it("should collect all matching nodes", () => {
      const fixture = new TraversalTestFixture();
      const { root } = fixture.createTree();

      const walker = new TreeWalker<ITestNode>(
        new DepthFirstTraversalStrategy<ITestNode>()
      );
      const visitor = new CollectVisitor<ITestNode>(
        (node) => node.id.startsWith("group")
      );

      walker.walk(root, visitor);

      expect(visitor.result.map((node) => node.id)).toEqual([
        "groupA",
        "groupB",
      ]);
    });
  });
});
