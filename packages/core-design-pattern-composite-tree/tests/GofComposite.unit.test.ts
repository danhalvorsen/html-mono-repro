
import { describe, expect, it } from "vitest";
import { GofCompositeFixture } from "../src/index.js";

describe("GOF Composite", () => {
  const fixture = new GofCompositeFixture();

  describe("Leaf", () => {
    it("should expose no children", () => {
      const sut = fixture.createLeaf();

      expect(sut.getChildren()).toEqual([]);
     expect(sut.getChildren()).toEqual([]);

    });

    it("should execute its own operation", () => {
      const sut = fixture.createLeaf("Leaf-A");

      sut.operation();

      expect(sut.executionLog).toEqual(["leaf:Leaf-A"]);
    });
  });

  describe("Composite", () => {
    it("should start with no children", () => {
      const sut = fixture.createComposite();

      expect(sut.getChildren()).toEqual([]);
 
    });

    it("should add children", () => {
      const sut = fixture.createComposite("Root");
      const child1 = fixture.createLeaf("Leaf-1");
      const child2 = fixture.createLeaf("Leaf-2");

      sut.add(child1);
      sut.add(child2);

      expect(sut.getChildren()).toHaveLength(2);
      expect(sut.getChildren()).toEqual([child1, child2]);
    });

    it("should remove matching children", () => {
      const { root, leaf1, leaf2 } = fixture.createCompositeWithTwoLeaves();

      root.remove(child => child === leaf1);

      expect(root.getChildren()).toEqual([leaf2]);
    });

    it("should ignore remove when no child matches", () => {
      const { root, leaf1, leaf2 } = fixture.createCompositeWithTwoLeaves();
      const missing = fixture.createLeaf("Missing");

      root.remove(child => child === missing);

      expect(root.getChildren()).toEqual([leaf1, leaf2]);
    });
  });

  describe("uniform client treatment", () => {
    it("should allow client to treat leaf and composite through the common abstraction", () => {
      const leaf = fixture.createLeaf("Leaf-A");
      const composite = fixture.createComposite("Root");

      composite.add(leaf);

      const components = [composite, leaf];

      expect(() => {
        for (const component of components) {
          component.operation();
        }
      }).not.toThrow();
    });
  });

  describe("recursive behavior", () => {
    it("should execute child operations when composite operation is invoked", () => {
      const { root, leaf1, leaf2 } = fixture.createCompositeWithTwoLeaves();

      root.operation();

      expect(root.executionLog).toEqual([
        "composite:Root:before",
        "composite:Root:after"
      ]);

      expect(leaf1.executionLog).toEqual(["leaf:Leaf-1"]);
      expect(leaf2.executionLog).toEqual(["leaf:Leaf-2"]);
    });

    it("should execute recursively through nested composites", () => {
      const { root, groupA, groupB, leaf1, leaf2, leaf3 } = fixture.createNestedTree();

      root.operation();

      expect(root.executionLog).toEqual([
        "composite:Root:before",
        "composite:Root:after"
      ]);

      expect(groupA.executionLog).toEqual([
        "composite:Group-A:before",
        "composite:Group-A:after"
      ]);

      expect(groupB.executionLog).toEqual([
        "composite:Group-B:before",
        "composite:Group-B:after"
      ]);

      expect(leaf1.executionLog).toEqual(["leaf:Leaf-1"]);
      expect(leaf2.executionLog).toEqual(["leaf:Leaf-2"]);
      expect(leaf3.executionLog).toEqual(["leaf:Leaf-3"]);
    });

    it("should preserve child order during traversal", () => {
      const { root, leaf1, leaf2 } = fixture.createCompositeWithTwoLeaves();

      root.operation();

      const combinedLog = [
        ...root.executionLog,
        ...leaf1.executionLog,
        ...leaf2.executionLog
      ];

      expect(combinedLog).toEqual([
        "composite:Root:before",
        "composite:Root:after",
        "leaf:Leaf-1",
        "leaf:Leaf-2"
      ]);

      expect(root.getChildren()[0]).toBe(leaf1);
      expect(root.getChildren()[1]).toBe(leaf2);
    });
  });
});