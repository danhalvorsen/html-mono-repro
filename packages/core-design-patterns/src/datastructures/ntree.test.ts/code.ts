// ============================================================================
// tests/ntree.test.ts
// ============================================================================

import { describe, it, expect } from "vitest";
import {
    NTreeNode,
    INTreeNode,
    walk,
    find,
    toArray
} from "../src/index.js"; // If your lib outputs JS, this is correct
// If you execute Vitest in TS mode, use:
// } from "../src/index.ts";

// Helper to create typed tree
function makeNode(value: string): INTreeNode<string> {
    return new NTreeNode<string>(value);
}

// ----------------------------------------------------------------------------
// Basic behavior
// ----------------------------------------------------------------------------
describe("NTreeNode", () => {

    it("creates a node with value", () => {
        const n = makeNode("root");

        expect(n.value).toBe("root");
        expect(n.parent).toBeNull();
        expect(n.children.length).toBe(0);
    });

    it("adds children correctly", () => {
        const root = makeNode("root");
        const child = makeNode("child");

        root.add(child);

        expect(root.children.length).toBe(1);
        expect(root.children[0]).toBe(child);
        expect(child.parent).toBe(root);
    });

    it("removes children", () => {
        const root = makeNode("root");
        const a = makeNode("a");
        const b = makeNode("b");

        root.add(a);
        root.add(b);
        root.remove(a);

        expect(root.children.length).toBe(1);
        expect(root.children[0]).toBe(b);
        expect(a.parent).toBeNull();
    });

    it("clears children", () => {
        const root = makeNode("root");
        const a = makeNode("a");
        const b = makeNode("b");

        root.add(a);
        root.add(b);
        root.clear();

        expect(root.children.length).toBe(0);
        expect(a.parent).toBeNull();
        expect(b.parent).toBeNull();
    });

    it("recognizes root and leaf nodes", () => {
        const root = makeNode("root");
        const child = makeNode("child");

        root.add(child);

        expect(root.isRoot()).toBe(true);
        expect(root.isLeaf()).toBe(false);

        expect(child.isRoot()).toBe(false);
        expect(child.isLeaf()).toBe(true);
    });

    it("returns correct root via getRoot()", () => {
        const root = makeNode("root");
        const a = makeNode("a");
        const b = makeNode("b");
        const c = makeNode("c");

        root.add(a);
        a.add(b);
        b.add(c);

        expect(c.getRoot()).toBe(root);
    });
});

// ----------------------------------------------------------------------------
// Traversal
// ----------------------------------------------------------------------------
describe("NTree Traversal", () => {

    function buildTree() {
        const root = makeNode("root");
        const a = makeNode("a");
        const b = makeNode("b");
        const c = makeNode("c");
        const d = makeNode("d");

        root.add(a);
        root.add(b);
        a.add(c);
        b.add(d);

        return { root, a, b, c, d };
    }

    it("walk() visits in DFS order", () => {
        const { root } = buildTree();
        const visited: string[] = [];

        walk<string>(root, (node: INTreeNode<string>) => {
            visited.push(node.value);
        });

        expect(visited).toEqual(["root", "a", "c", "b", "d"]);
    });

    it("find() finds correct node", () => {
        const { root } = buildTree();

        const r = find<string>(root, (v: string) => v === "c");
        expect(r?.value).toBe("c");
    });

    it("find() returns null if not found", () => {
        const { root } = buildTree();

        const r = find<string>(root, (v: string) => v === "nope");
        expect(r).toBeNull();
    });

    it("toArray() flattens in DFS order", () => {
        const { root } = buildTree();

        const arr = toArray<string>(root).map(n => n.value);
        expect(arr).toEqual(["root", "a", "c", "b", "d"]);
    });
});
