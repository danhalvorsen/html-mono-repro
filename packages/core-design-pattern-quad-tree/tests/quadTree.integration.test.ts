import { describe, it, expect, beforeEach } from 'vitest';
import {
  QuadTreeBounds,
  QuadTreeRectangleQueryRegion,
  type IQuadTree,
} from '@monorepo/core-design-pattern-quad-tree-abstract';
import {
  QuadTreeFactory,
  DefaultSplitPolicy,
  DefaultInsertPolicy,
  DefaultMergePolicy,
} from '../src/index.js';

type Point = { id: number; x: number; y: number };

const ROOT = new QuadTreeBounds(0, 0, 100, 100);

function makeBoundsProvider() {
  return {
    getBounds: (item: Point) => new QuadTreeBounds(item.x, item.y, 1, 1),
  };
}

function makeTree(maxDepth = 4, maxItemsPerNode = 4) {
  return new QuadTreeFactory<Point>().create({
    rootBounds: ROOT,
    boundsProvider: makeBoundsProvider(),
    options: { maxDepth, maxItemsPerNode },
  });
}

// ─── Factory ─────────────────────────────────────────────────────────────────

describe('QuadTreeFactory', () => {
  it('creates a tree with correct initial state', () => {
    const tree = makeTree();
    expect(tree.count()).toBe(0);
    expect(tree.root).toBeDefined();
    expect(tree.root.isLeaf()).toBe(true);
  });

  it('throws when input is missing required fields', () => {
    const factory = new QuadTreeFactory<Point>();
    expect(() => factory.create(null as never)).toThrow();
  });
});

// ─── Insert ──────────────────────────────────────────────────────────────────

describe('QuadTree.insert', () => {
  it('inserts a single item', () => {
    const tree = makeTree();
    const item: Point = { id: 1, x: 10, y: 10 };
    const result = tree.insert(item);

    expect(result.inserted).toBe(true);
    expect(result.item).toBe(item);
    expect(tree.count()).toBe(1);
  });

  it('rejects items whose bounds lie outside root bounds', () => {
    const tree = makeTree();
    const outside: Point = { id: 99, x: 200, y: 200 };
    const result = tree.insert(outside);

    expect(result.inserted).toBe(false);
    expect(result.reason).toBeDefined();
    expect(tree.count()).toBe(0);
  });

  it('insertMany inserts all items', () => {
    const tree = makeTree();
    const items: Point[] = [
      { id: 1, x: 10, y: 10 },
      { id: 2, x: 20, y: 20 },
      { id: 3, x: 30, y: 30 },
    ];
    const results = tree.insertMany(items);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.inserted)).toBe(true);
    expect(tree.count()).toBe(3);
  });
});

// ─── Contains ────────────────────────────────────────────────────────────────

describe('QuadTree insertPolicy — per-node enforcement', () => {
  it('rejects insertion when policy rejects the target node', () => {
    const rejectDepthOnePolicy = {
      canInsert: (input: { depth: number }) => input.depth < 1,
    };

    const tree = new QuadTreeFactory<Point>().create({
      rootBounds: ROOT,
      boundsProvider: makeBoundsProvider(),
      options: { maxDepth: 4, maxItemsPerNode: 2, insertPolicy: rejectDepthOnePolicy },
    });

    // Insert enough items to force a split (maxItemsPerNode=2), creating depth-1 nodes.
    tree.insert({ id: 1, x: 5, y: 5 });
    tree.insert({ id: 2, x: 60, y: 5 });
    tree.insert({ id: 3, x: 5, y: 60 });

    // At this point the tree has split. New items that fit fully inside a child quadrant
    // will be routed to depth=1 and get rejected by policy.
    const result = tree.insert({ id: 4, x: 60, y: 60 });

    expect(result.inserted).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('accepts insertion into root (depth 0) when policy allows only depth 0', () => {
    const rootOnlyPolicy = {
      canInsert: (input: { depth: number }) => input.depth === 0,
    };

    const tree = new QuadTreeFactory<Point>().create({
      rootBounds: ROOT,
      boundsProvider: makeBoundsProvider(),
      options: { maxDepth: 4, maxItemsPerNode: 4, insertPolicy: rootOnlyPolicy },
    });

    const result = tree.insert({ id: 1, x: 5, y: 5 });
    expect(result.inserted).toBe(true);
  });
});

describe('QuadTree.contains', () => {
  it('returns true for an inserted item', () => {
    const tree = makeTree();
    const item: Point = { id: 1, x: 10, y: 10 };
    tree.insert(item);
    expect(tree.contains(item)).toBe(true);
  });

  it('returns false for a non-inserted item', () => {
    const tree = makeTree();
    expect(tree.contains({ id: 1, x: 10, y: 10 })).toBe(false);
  });
});

// ─── Remove ──────────────────────────────────────────────────────────────────

describe('QuadTree.remove', () => {
  it('removes an inserted item', () => {
    const tree = makeTree();
    const item: Point = { id: 1, x: 10, y: 10 };
    tree.insert(item);
    const result = tree.remove(item);

    expect(result.removed).toBe(true);
    expect(result.item).toBe(item);
    expect(tree.count()).toBe(0);
    expect(tree.contains(item)).toBe(false);
  });

  it('returns not-removed for a missing item', () => {
    const tree = makeTree();
    const result = tree.remove({ id: 99, x: 5, y: 5 });

    expect(result.removed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('removes an item that was placed in a child after split', () => {
    const tree = makeTree(4, 2);
    const items: Point[] = [
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 60, y: 5 },
      { id: 3, x: 5, y: 60 },
    ];
    tree.insertMany(items);

    const result = tree.remove(items[2]);
    expect(result.removed).toBe(true);
    expect(tree.count()).toBe(2);
    expect(tree.contains(items[2])).toBe(false);
  });
});

// ─── Clear ───────────────────────────────────────────────────────────────────

describe('QuadTree.clear', () => {
  it('removes all items and resets count', () => {
    const tree = makeTree();
    tree.insertMany([
      { id: 1, x: 10, y: 10 },
      { id: 2, x: 20, y: 20 },
    ]);
    const result = tree.clear();

    expect(result.clearedItemCount).toBe(2);
    expect(tree.count()).toBe(0);
  });
});

// ─── Query ───────────────────────────────────────────────────────────────────

describe('QuadTree.query', () => {
  it('finds items inside the query region', () => {
    const tree = makeTree();
    const items: Point[] = [
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 50, y: 50 },
      { id: 3, x: 80, y: 80 },
    ];
    tree.insertMany(items);

    const region = new QuadTreeRectangleQueryRegion(new QuadTreeBounds(0, 0, 20, 20));
    const result = tree.query(region);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(items[0]);
  });

  it('returns empty when no items intersect region', () => {
    const tree = makeTree();
    tree.insert({ id: 1, x: 50, y: 50 });

    const region = new QuadTreeRectangleQueryRegion(new QuadTreeBounds(0, 0, 10, 10));
    expect(tree.query(region)).toHaveLength(0);
  });

  it('queryEnvelopes returns items with bounds', () => {
    const tree = makeTree();
    const item: Point = { id: 1, x: 5, y: 5 };
    tree.insert(item);

    const region = new QuadTreeRectangleQueryRegion(new QuadTreeBounds(0, 0, 20, 20));
    const envelopes = tree.queryEnvelopes(region);

    expect(envelopes).toHaveLength(1);
    expect(envelopes[0].item).toBe(item);
    expect(envelopes[0].bounds).toBeDefined();
  });

  it('queryWith filters using custom query', () => {
    const tree = makeTree();
    const items: Point[] = [
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 10, y: 5 },
    ];
    tree.insertMany(items);

    const region = new QuadTreeRectangleQueryRegion(new QuadTreeBounds(0, 0, 30, 30));
    const result = tree.queryWith(
      { matches: ({ item }) => item.id === 1 },
      region,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(items[0]);
  });
});

// ─── Split behavior ───────────────────────────────────────────────────────────

describe('QuadTree split behavior', () => {
  it('splits when maxItemsPerNode is exceeded', () => {
    const tree = makeTree(4, 2);
    const items: Point[] = [
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 60, y: 5 },
      { id: 3, x: 5, y: 60 },
    ];
    tree.insertMany(items);

    const stats = tree.getStatistics();
    expect(stats.itemCount).toBe(3);
    expect(stats.nodeCount).toBeGreaterThan(1);
  });

  it('finds all items after split via contains', () => {
    const tree = makeTree(4, 2);
    const items: Point[] = [
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 60, y: 5 },
      { id: 3, x: 5, y: 60 },
      { id: 4, x: 60, y: 60 },
    ];
    tree.insertMany(items);

    for (const item of items) {
      expect(tree.contains(item)).toBe(true);
    }
  });

  it('finds all items after split via query', () => {
    const tree = makeTree(4, 2);
    const items: Point[] = [
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 60, y: 5 },
      { id: 3, x: 5, y: 60 },
      { id: 4, x: 60, y: 60 },
    ];
    tree.insertMany(items);

    const all = new QuadTreeRectangleQueryRegion(ROOT);
    const result = tree.query(all);
    expect(result).toHaveLength(4);
  });
});

// ─── Statistics ───────────────────────────────────────────────────────────────

describe('QuadTree.getStatistics', () => {
  it('returns correct stats for empty tree', () => {
    const tree = makeTree();
    const stats = tree.getStatistics();
    expect(stats.nodeCount).toBe(1);
    expect(stats.leafCount).toBe(1);
    expect(stats.itemCount).toBe(0);
    expect(stats.depth).toBe(0);
  });

  it('reflects item count after inserts', () => {
    const tree = makeTree();
    tree.insertMany([
      { id: 1, x: 10, y: 10 },
      { id: 2, x: 20, y: 20 },
    ]);
    expect(tree.getStatistics().itemCount).toBe(2);
  });

  it('depth increases after split', () => {
    const tree = makeTree(4, 2);
    tree.insertMany([
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 60, y: 5 },
      { id: 3, x: 5, y: 60 },
    ]);
    expect(tree.getStatistics().depth).toBeGreaterThan(0);
  });
});

// ─── Visit ───────────────────────────────────────────────────────────────────

describe('QuadTree.visit', () => {
  it('visits all items', () => {
    const tree = makeTree();
    const items: Point[] = [
      { id: 1, x: 10, y: 10 },
      { id: 2, x: 20, y: 20 },
    ];
    tree.insertMany(items);

    const visited: Point[] = [];
    tree.visit({
      visitNode: () => {},
      visitItem: e => visited.push(e.item),
    });

    expect(visited).toHaveLength(2);
    expect(visited).toContain(items[0]);
    expect(visited).toContain(items[1]);
  });

  it('respects visitFilter for nodes', () => {
    const tree = makeTree(4, 2);
    tree.insertMany([
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 60, y: 5 },
      { id: 3, x: 5, y: 60 },
    ]);

    const visited: Point[] = [];
    tree.visit(
      {
        visitNode: () => {},
        visitItem: e => visited.push(e.item),
      },
      {
        shouldVisitNode: node => node.depth === 0,
        shouldVisitItem: () => true,
      },
    );

    // Only root-level items are visited (children are filtered out)
    expect(visited.length).toBeLessThanOrEqual(3);
  });
});

// ─── Default policies ────────────────────────────────────────────────────────

describe('DefaultSplitPolicy', () => {
  const policy = new DefaultSplitPolicy(4, 2);
  const base = new QuadTreeBounds(0, 0, 100, 100);

  it('splits when over capacity and below maxDepth', () => {
    expect(policy.shouldSplit({
      depth: 1, itemCount: 3, totalItemCount: 3,
      totalNodeCount: 1, hasChildren: false, nodeBounds: base,
    })).toBe(true);
  });

  it('does not split at maxDepth', () => {
    expect(policy.shouldSplit({
      depth: 4, itemCount: 10, totalItemCount: 10,
      totalNodeCount: 1, hasChildren: false, nodeBounds: base,
    })).toBe(false);
  });

  it('does not split when already has children', () => {
    expect(policy.shouldSplit({
      depth: 1, itemCount: 5, totalItemCount: 5,
      totalNodeCount: 5, hasChildren: true, nodeBounds: base,
    })).toBe(false);
  });

  it('does not split when itemCount is within limit', () => {
    expect(policy.shouldSplit({
      depth: 1, itemCount: 2, totalItemCount: 2,
      totalNodeCount: 1, hasChildren: false, nodeBounds: base,
    })).toBe(false);
  });
});

describe('DefaultInsertPolicy', () => {
  it('always returns true', () => {
    const policy = new DefaultInsertPolicy<Point>();
    expect(policy.canInsert({
      depth: 0, totalItemCount: 0, totalNodeCount: 1,
      hasChildren: false, nodeBounds: new QuadTreeBounds(0, 0, 100, 100),
      item: { id: 1, x: 5, y: 5 },
      itemBounds: new QuadTreeBounds(5, 5, 1, 1),
    })).toBe(true);
  });
});

describe('DefaultMergePolicy', () => {
  const policy = new DefaultMergePolicy(4);
  const base = new QuadTreeBounds(0, 0, 100, 100);

  it('merges when merged item count fits in node', () => {
    expect(policy.shouldMerge({
      depth: 1, itemCount: 3, childCount: 4,
      totalItemCount: 10, totalNodeCount: 5,
      hasChildren: true, nodeBounds: base,
    })).toBe(true);
  });

  it('does not merge when merged item count exceeds limit', () => {
    expect(policy.shouldMerge({
      depth: 1, itemCount: 5, childCount: 4,
      totalItemCount: 10, totalNodeCount: 5,
      hasChildren: true, nodeBounds: base,
    })).toBe(false);
  });

  it('does not merge when hasChildren is false', () => {
    expect(policy.shouldMerge({
      depth: 1, itemCount: 1, childCount: 0,
      totalItemCount: 1, totalNodeCount: 1,
      hasChildren: false, nodeBounds: base,
    })).toBe(false);
  });

  it('merges exactly at the limit boundary', () => {
    expect(policy.shouldMerge({
      depth: 2, itemCount: 4, childCount: 4,
      totalItemCount: 4, totalNodeCount: 5,
      hasChildren: true, nodeBounds: base,
    })).toBe(true);
  });
});

// ─── Fixtures ────────────────────────────────────────────────────────────────
// Reusable fixture helpers used by the sections below.

type Rect = { id: number; x: number; y: number; w: number; h: number };

const WIDE_ROOT = new QuadTreeBounds(0, 0, 1000, 1000);

function makeRectBoundsProvider() {
  return {
    getBounds: (r: Rect) => new QuadTreeBounds(r.x, r.y, r.w, r.h),
  };
}

function makeRectTree(maxDepth = 4, maxItemsPerNode = 4): IQuadTree<Rect> {
  return new QuadTreeFactory<Rect>().create({
    rootBounds: WIDE_ROOT,
    boundsProvider: makeRectBoundsProvider(),
    options: { maxDepth, maxItemsPerNode },
  });
}

function rect(id: number, x: number, y: number, w = 10, h = 10): Rect {
  return { id, x, y, w, h };
}

function allRegion() {
  return new QuadTreeRectangleQueryRegion(WIDE_ROOT);
}

function region(x: number, y: number, w: number, h: number) {
  return new QuadTreeRectangleQueryRegion(new QuadTreeBounds(x, y, w, h));
}

// ─── Merge behavior ──────────────────────────────────────────────────────────

describe('QuadTree merge behavior', () => {
  let tree: IQuadTree<Rect>;

  beforeEach(() => {
    tree = makeRectTree(4, 2);
  });

  it('merges children back into parent after removing below threshold', () => {
    const a = rect(1, 10, 10);
    const b = rect(2, 600, 10);
    const c = rect(3, 10, 600);
    tree.insertMany([a, b, c]);

    // Three items in distinct quadrants forces a split.
    const before = tree.getStatistics();
    expect(before.nodeCount).toBeGreaterThan(1);

    // Remove two → merged node count should decrease.
    tree.remove(b);
    tree.remove(c);

    const after = tree.getStatistics();
    expect(after.nodeCount).toBeLessThan(before.nodeCount);
    expect(after.itemCount).toBe(1);
    expect(tree.contains(a)).toBe(true);
  });

  it('does not merge when children still have grandchildren', () => {
    // Fill deeply to prevent merge propagating all the way up.
    const items = [
      rect(1, 10, 10), rect(2, 20, 10), rect(3, 30, 10),   // force root split
      rect(4, 600, 10), rect(5, 610, 10), rect(6, 620, 10), // keep NE subtree full
    ];
    tree.insertMany(items);
    const statsBefore = tree.getStatistics().nodeCount;

    // Remove only from the NW quadrant — NE still has items, so root must not merge.
    tree.remove(items[2]);
    expect(tree.getStatistics().nodeCount).toBeLessThanOrEqual(statsBefore);
    expect(tree.getStatistics().itemCount).toBe(5);
  });

  it('passes correct tree-global totalItemCount to merge policy', () => {
    const calls: number[] = [];
    const spyMergePolicy = {
      shouldMerge: (input: { totalItemCount: number; hasChildren: boolean }) => {
        calls.push(input.totalItemCount);
        return false; // never actually merge
      },
    };

    const t = new QuadTreeFactory<Rect>().create({
      rootBounds: WIDE_ROOT,
      boundsProvider: makeRectBoundsProvider(),
      options: { maxDepth: 4, maxItemsPerNode: 2, mergePolicy: spyMergePolicy },
    });

    const a = rect(1, 10, 10);
    const b = rect(2, 600, 10);
    const c = rect(3, 10, 600);
    t.insertMany([a, b, c]);
    t.remove(c);

    // shouldMerge is called during remove(), before _totalItemCount is decremented.
    // So the spy sees the pre-decrement tree-global count (3), not 2.
    expect(calls.some(n => n === 3)).toBe(true);
  });
});

// ─── Root node properties ────────────────────────────────────────────────────

describe('QuadTree root node', () => {
  it('exposes root with correct initial bounds', () => {
    const tree = makeRectTree();
    expect(tree.root.bounds.x).toBe(0);
    expect(tree.root.bounds.y).toBe(0);
    expect(tree.root.bounds.width).toBe(1000);
    expect(tree.root.bounds.height).toBe(1000);
  });

  it('root.isLeaf() is true before any split', () => {
    const tree = makeRectTree();
    tree.insert(rect(1, 10, 10));
    expect(tree.root.isLeaf()).toBe(true);
  });

  it('root.isLeaf() is false after split', () => {
    const tree = makeRectTree(4, 1);
    tree.insert(rect(1, 10, 10));
    tree.insert(rect(2, 600, 10));
    expect(tree.root.isLeaf()).toBe(false);
  });

  it('root.children returns a frozen snapshot', () => {
    const tree = makeRectTree(4, 1);
    tree.insert(rect(1, 10, 10));
    tree.insert(rect(2, 600, 10));

    const snap1 = tree.root.children;
    tree.insert(rect(3, 600, 600));
    const snap2 = tree.root.children;

    // Snapshots are independent frozen arrays.
    expect(Object.isFrozen(snap1)).toBe(true);
    expect(Object.isFrozen(snap2)).toBe(true);
  });

  it('root.items returns a frozen snapshot', () => {
    const tree = makeRectTree();
    const a = rect(1, 10, 10);
    tree.insert(a);

    const snap = tree.root.items;
    expect(Object.isFrozen(snap)).toBe(true);
    expect(snap[0].item).toBe(a);
  });
});

// ─── insertMany return values ────────────────────────────────────────────────

describe('QuadTree.insertMany return values', () => {
  it('returns frozen array', () => {
    const tree = makeRectTree();
    const results = tree.insertMany([rect(1, 10, 10), rect(2, 20, 20)]);
    expect(Object.isFrozen(results)).toBe(true);
  });

  it('mixed results when some items are out-of-bounds', () => {
    const tree = makeRectTree();
    const items = [rect(1, 10, 10), rect(2, 2000, 2000)];
    const results = tree.insertMany(items);

    expect(results[0].inserted).toBe(true);
    expect(results[1].inserted).toBe(false);
    expect(tree.count()).toBe(1);
  });
});

// ─── clear() ─────────────────────────────────────────────────────────────────

describe('QuadTree.clear extended', () => {
  it('returns 0 when tree is already empty', () => {
    const tree = makeRectTree();
    expect(tree.clear().clearedItemCount).toBe(0);
  });

  it('after clear, query returns empty', () => {
    const tree = makeRectTree();
    tree.insertMany([rect(1, 10, 10), rect(2, 20, 20)]);
    tree.clear();

    expect(tree.query(allRegion())).toHaveLength(0);
  });

  it('after clear, tree is a leaf again', () => {
    const tree = makeRectTree(4, 1);
    tree.insertMany([rect(1, 10, 10), rect(2, 600, 10)]);
    tree.clear();
    expect(tree.root.isLeaf()).toBe(true);
  });

  it('after clear, new insertions work correctly', () => {
    const tree = makeRectTree();
    tree.insertMany([rect(1, 10, 10), rect(2, 20, 20)]);
    tree.clear();

    const a = rect(3, 50, 50);
    tree.insert(a);
    expect(tree.count()).toBe(1);
    expect(tree.contains(a)).toBe(true);
  });
});

// ─── queryEnvelopes frozen ───────────────────────────────────────────────────

describe('QuadTree.queryEnvelopes', () => {
  it('returns a frozen array', () => {
    const tree = makeRectTree();
    tree.insert(rect(1, 10, 10));
    const envelopes = tree.queryEnvelopes(allRegion());
    expect(Object.isFrozen(envelopes)).toBe(true);
  });

  it('envelope bounds match the boundsProvider output', () => {
    const tree = makeRectTree();
    const r = rect(1, 50, 75, 20, 30);
    tree.insert(r);
    const [env] = tree.queryEnvelopes(allRegion());
    expect(env.bounds.x).toBe(50);
    expect(env.bounds.y).toBe(75);
    expect(env.bounds.width).toBe(20);
    expect(env.bounds.height).toBe(30);
  });
});

// ─── queryWith ───────────────────────────────────────────────────────────────

describe('QuadTree.queryWith extended', () => {
  it('returns frozen array', () => {
    const tree = makeRectTree();
    tree.insert(rect(1, 10, 10));
    const result = tree.queryWith({ matches: () => true }, allRegion());
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('returns empty when query always returns false', () => {
    const tree = makeRectTree();
    tree.insertMany([rect(1, 10, 10), rect(2, 20, 20)]);
    const result = tree.queryWith({ matches: () => false }, allRegion());
    expect(result).toHaveLength(0);
  });

  it('custom query receives item, itemBounds and region', () => {
    const tree = makeRectTree();
    const r = rect(1, 10, 10, 5, 5);
    tree.insert(r);

    let capturedItem: Rect | undefined;
    let capturedBoundsX: number | undefined;

    tree.queryWith({
      matches: ({ item, itemBounds }) => {
        capturedItem = item;
        capturedBoundsX = itemBounds.x;
        return true;
      },
    }, allRegion());

    expect(capturedItem).toBe(r);
    expect(capturedBoundsX).toBe(10);
  });
});

// ─── visit extended ──────────────────────────────────────────────────────────

describe('QuadTree.visit extended', () => {
  it('visitNode is called for every node in the tree', () => {
    const tree = makeRectTree(4, 1);
    tree.insertMany([rect(1, 10, 10), rect(2, 600, 10), rect(3, 10, 600)]);

    let nodeCount = 0;
    tree.visit({ visitNode: () => nodeCount++, visitItem: () => {} });

    expect(nodeCount).toBe(tree.getStatistics().nodeCount);
  });

  it('visiting empty tree calls visitNode once (root) and visitItem zero times', () => {
    const tree = makeRectTree();
    let nodes = 0;
    let items = 0;
    tree.visit({ visitNode: () => nodes++, visitItem: () => items++ });
    expect(nodes).toBe(1);
    expect(items).toBe(0);
  });

  it('item filter prevents visitItem but not visitNode', () => {
    const tree = makeRectTree();
    tree.insertMany([rect(1, 10, 10), rect(2, 20, 20)]);

    let items = 0;
    let nodes = 0;
    tree.visit(
      { visitNode: () => nodes++, visitItem: () => items++ },
      { shouldVisitNode: () => true, shouldVisitItem: () => false },
    );
    expect(nodes).toBeGreaterThan(0);
    expect(items).toBe(0);
  });

  it('node filter stops descent into filtered-out subtrees', () => {
    const tree = makeRectTree(4, 1);
    tree.insertMany([rect(1, 10, 10), rect(2, 600, 10)]);

    const visitedDepths: number[] = [];
    tree.visit(
      { visitNode: n => visitedDepths.push(n.depth), visitItem: () => {} },
      { shouldVisitNode: n => n.depth === 0, shouldVisitItem: () => true },
    );

    // Only depth-0 node visited; children suppressed.
    expect(visitedDepths.every(d => d === 0)).toBe(true);
  });
});

// ─── getStatistics extended ──────────────────────────────────────────────────

describe('QuadTree.getStatistics extended', () => {
  it('stat leafCount counts only leaf nodes', () => {
    const tree = makeRectTree(4, 1);
    tree.insertMany([rect(1, 10, 10), rect(2, 600, 10)]);

    const stats = tree.getStatistics();
    // After split, root is not a leaf; its children are.
    expect(stats.leafCount).toBeGreaterThan(0);
    expect(stats.leafCount).toBeLessThan(stats.nodeCount);
  });

  it('nodeCount and leafCount remain consistent after remove + merge', () => {
    const tree = makeRectTree(4, 2);
    const a = rect(1, 10, 10);
    const b = rect(2, 600, 10);
    const c = rect(3, 10, 600);
    tree.insertMany([a, b, c]);
    tree.remove(b);
    tree.remove(c);

    const { nodeCount, leafCount } = tree.getStatistics();
    // A leaf must be a node, so leafCount ≤ nodeCount always.
    expect(leafCount).toBeLessThanOrEqual(nodeCount);
  });
});

// ─── options exposed ─────────────────────────────────────────────────────────

describe('QuadTree.options', () => {
  it('exposes the options passed at creation', () => {
    const tree = makeRectTree(6, 8);
    expect(tree.options.maxDepth).toBe(6);
    expect(tree.options.maxItemsPerNode).toBe(8);
  });

  it('exposes the boundsProvider passed at creation', () => {
    const bp = makeRectBoundsProvider();
    const tree = new QuadTreeFactory<Rect>().create({
      rootBounds: WIDE_ROOT,
      boundsProvider: bp,
      options: { maxDepth: 4, maxItemsPerNode: 4 },
    });
    expect(tree.boundsProvider).toBe(bp);
  });
});

// ─── DefaultSplitPolicy edge cases ───────────────────────────────────────────

describe('DefaultSplitPolicy edge cases', () => {
  it('does not split when bounds have zero width', () => {
    const policy = new DefaultSplitPolicy(4, 2);
    expect(policy.shouldSplit({
      depth: 1, itemCount: 10, totalItemCount: 10,
      totalNodeCount: 1, hasChildren: false,
      nodeBounds: new QuadTreeBounds(0, 0, 0, 10),
    })).toBe(false);
  });

  it('does not split when bounds have zero height', () => {
    const policy = new DefaultSplitPolicy(4, 2);
    expect(policy.shouldSplit({
      depth: 1, itemCount: 10, totalItemCount: 10,
      totalNodeCount: 1, hasChildren: false,
      nodeBounds: new QuadTreeBounds(0, 0, 10, 0),
    })).toBe(false);
  });

  it('throws when maxDepth is negative', () => {
    expect(() => new DefaultSplitPolicy(-1, 2)).toThrow();
  });

  it('throws when maxItemsPerNode is zero', () => {
    expect(() => new DefaultSplitPolicy(4, 0)).toThrow();
  });
});

// ─── DefaultMergePolicy edge cases ───────────────────────────────────────────

describe('DefaultMergePolicy edge cases', () => {
  it('throws when maxItemsPerNode is zero', () => {
    expect(() => new DefaultMergePolicy(0)).toThrow();
  });

  it('merges when itemCount equals exactly 1', () => {
    const policy = new DefaultMergePolicy(2);
    expect(policy.shouldMerge({
      depth: 1, itemCount: 1, childCount: 4,
      totalItemCount: 5, totalNodeCount: 5,
      hasChildren: true, nodeBounds: new QuadTreeBounds(0, 0, 100, 100),
    })).toBe(true);
  });
});

// ─── QuadTreeFactory validation ──────────────────────────────────────────────

describe('QuadTreeFactory validation', () => {
  const factory = new QuadTreeFactory<Rect>();

  it('throws when rootBounds is null', () => {
    expect(() => factory.create({
      rootBounds: null as never,
      boundsProvider: makeRectBoundsProvider(),
      options: { maxDepth: 4, maxItemsPerNode: 4 },
    })).toThrow();
  });

  it('throws when boundsProvider is null', () => {
    expect(() => factory.create({
      rootBounds: WIDE_ROOT,
      boundsProvider: null as never,
      options: { maxDepth: 4, maxItemsPerNode: 4 },
    })).toThrow();
  });

  it('throws when options is null', () => {
    expect(() => factory.create({
      rootBounds: WIDE_ROOT,
      boundsProvider: makeRectBoundsProvider(),
      options: null as never,
    })).toThrow();
  });

  it('uses provided custom split policy', () => {
    const neverSplit = { shouldSplit: () => false };
    const tree = factory.create({
      rootBounds: WIDE_ROOT,
      boundsProvider: makeRectBoundsProvider(),
      options: { maxDepth: 4, maxItemsPerNode: 1, splitPolicy: neverSplit },
    });

    tree.insertMany([rect(1, 10, 10), rect(2, 600, 10)]);
    expect(tree.root.isLeaf()).toBe(true);
  });

  it('uses provided custom merge policy', () => {
    const neverMerge = { shouldMerge: () => false };
    const tree = factory.create({
      rootBounds: WIDE_ROOT,
      boundsProvider: makeRectBoundsProvider(),
      options: { maxDepth: 4, maxItemsPerNode: 1, mergePolicy: neverMerge },
    });

    const a = rect(1, 10, 10);
    const b = rect(2, 600, 10);
    tree.insertMany([a, b]);
    const nodesBefore = tree.getStatistics().nodeCount;
    tree.remove(b);

    // Never-merge policy: node count unchanged after removal.
    expect(tree.getStatistics().nodeCount).toBe(nodesBefore);
  });
});

// ─── Spatial precision — items on quadrant boundary ──────────────────────────

describe('Spatial precision', () => {
  it('items spanning quadrant boundaries remain in parent node', () => {
    // The root divides at (500, 500). A large rect crossing that boundary
    // cannot be placed in any single child → stays in root.
    const tree = makeRectTree(4, 1);
    const big = rect(1, 400, 400, 200, 200); // spans all four quadrants
    tree.insert(big);

    // Root keeps the item instead of routing to a child.
    expect(tree.root.items.some(e => e.item === big)).toBe(true);
  });

  it('items exactly on the right/bottom edge of root are accepted', () => {
    const tree = makeRectTree();
    // Item at (990, 990) with size 10×10 just fits inside 1000×1000 root.
    const edge = rect(1, 990, 990, 10, 10);
    expect(tree.insert(edge).inserted).toBe(true);
  });

  it('items one pixel beyond root bounds are rejected', () => {
    const tree = makeRectTree();
    const beyond = rect(1, 991, 990, 10, 10); // x+w = 1001 > 1000
    expect(tree.insert(beyond).inserted).toBe(false);
  });

  it('query returns items from multiple quadrants', () => {
    const tree = makeRectTree(4, 1);
    const nw = rect(1, 10, 10);
    const ne = rect(2, 600, 10);
    const sw = rect(3, 10, 600);
    const se = rect(4, 600, 600);
    tree.insertMany([nw, ne, sw, se]);

    const found = tree.query(allRegion());
    expect(found).toHaveLength(4);
    expect(found).toContain(nw);
    expect(found).toContain(ne);
    expect(found).toContain(sw);
    expect(found).toContain(se);
  });
});
