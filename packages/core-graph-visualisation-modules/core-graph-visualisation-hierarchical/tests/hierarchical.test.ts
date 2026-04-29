// packages/core-graph-visualisation-hierarchical/tests/hierarchical.test.ts
// No imports by request. Assumes Vitest globals and production types/classes are available in test scope.
import { describe, expect, it, beforeEach } from "vitest";  
import { BoxConstraints, GraphCanvasConstraints, GraphLayoutModel, GraphLayoutRequest, GraphNodeAnchor, HierarchicalConstraintEngine, HierarchicalGraphValidator, HierarchicalLayoutReactiveController, IGraphLayoutStrategy, IHierarchicalGraphValidator, ReactiveController, ReactiveControllerHost, TidyTreeLayoutStrategy, TidyTreeOptions } from "../src/index.js";
type TestNode<TPayload = unknown> = {
  readonly id: string;
  readonly payload: TPayload;
};

type TestEdge<TPayload = unknown> = {
  readonly source: TestNode<TPayload>;
  readonly target: TestNode<TPayload>;
};

type TestGraph<TPayload = unknown> = {
  readonly nodes: readonly TestNode<TPayload>[];
  readonly edges: readonly TestEdge<TPayload>[];
};

class ReactiveControllerHostSpy implements ReactiveControllerHost {
  public readonly controllers: ReactiveController[] = [];
  public requestUpdateCallCount = 0;

  addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  requestUpdate(): void {
    this.requestUpdateCallCount += 1;
  }
}

class HierarchicalTestFixture {
  public readonly canvas: GraphCanvasConstraints = {
    width: 800,
    height: 600,
    padding: 48,
  };

  public readonly box: BoxConstraints = {
    width: 112,
    height: 56,
  };

  public createNode<TPayload = unknown>(
    id: string,
    payload: TPayload = null as TPayload,
  ): TestNode<TPayload> {
    return {
      id,
      payload,
    };
  }

  public createGraph<TPayload = unknown>(
    nodes: readonly TestNode<TPayload>[],
    edges: readonly TestEdge<TPayload>[] = [],
  ): TestGraph<TPayload> {
    return {
      nodes,
      edges,
    };
  }

  public connect<TPayload = unknown>(
    source: TestNode<TPayload>,
    target: TestNode<TPayload>,
  ): TestEdge<TPayload> {
    return {
      source,
      target,
    };
  }

  public createSingleRootTree(): TestGraph {
    const root = this.createNode("root");
    const child = this.createNode("child");

    return this.createGraph(
      [root, child],
      [this.connect(root, child)],
    );
  }

  public createRootWithTwoChildrenTree(): TestGraph {
    const root = this.createNode("root");
    const left = this.createNode("left");
    const right = this.createNode("right");

    return this.createGraph(
      [root, left, right],
      [
        this.connect(root, left),
        this.connect(root, right),
      ],
    );
  }

  public createDeepTree(): TestGraph {
    const root = this.createNode("root");
    const child = this.createNode("child");
    const grandChild = this.createNode("grand-child");

    return this.createGraph(
      [root, child, grandChild],
      [
        this.connect(root, child),
        this.connect(child, grandChild),
      ],
    );
  }

  public createMultipleRootsForest(): TestGraph {
    const rootA = this.createNode("root-a");
    const childA = this.createNode("child-a");
    const rootB = this.createNode("root-b");
    const childB = this.createNode("child-b");

    return this.createGraph(
      [rootA, childA, rootB, childB],
      [
        this.connect(rootA, childA),
        this.connect(rootB, childB),
      ],
    );
  }

  public createGraphWithCycle(): TestGraph {
    const a = this.createNode("a");
    const b = this.createNode("b");
    const c = this.createNode("c");

    return this.createGraph(
      [a, b, c],
      [
        this.connect(a, b),
        this.connect(b, c),
        this.connect(c, a),
      ],
    );
  }

  public createGraphWithMultipleParents(): TestGraph {
    const rootA = this.createNode("root-a");
    const rootB = this.createNode("root-b");
    const child = this.createNode("child");

    return this.createGraph(
      [rootA, rootB, child],
      [
        this.connect(rootA, child),
        this.connect(rootB, child),
      ],
    );
  }

  public createGraphWithDuplicateNodeIds(): TestGraph {
    const first = this.createNode("same-id");
    const second = this.createNode("same-id");

    return this.createGraph([first, second], []);
  }

  public createLayoutRequest(
    graph: TestGraph,
    canvas: GraphCanvasConstraints = this.canvas,
    box: BoxConstraints = this.box,
  ): GraphLayoutRequest {
    return {
      graph,
      canvas,
      box,
    };
  }

  public createValidator(): HierarchicalGraphValidator {
    return new HierarchicalGraphValidator();
  }

  public createStrategy(
    options?: TidyTreeOptions,
  ): TidyTreeLayoutStrategy {
    return new TidyTreeLayoutStrategy(options);
  }

  public createConstraintEngine(
    strategy: IGraphLayoutStrategy = this.createStrategy(),
    validator: IHierarchicalGraphValidator = this.createValidator(),
  ): HierarchicalConstraintEngine {
    return new HierarchicalConstraintEngine(strategy, validator);
  }

  public createHostSpy(): ReactiveControllerHostSpy {
    return new ReactiveControllerHostSpy();
  }

  public createController(
    host: ReactiveControllerHost = this.createHostSpy(),
    strategy: IGraphLayoutStrategy = this.createStrategy(),
  ): HierarchicalLayoutReactiveController {
    return new HierarchicalLayoutReactiveController(host, strategy);
  }

  public getAnchorById(
    layout: GraphLayoutModel,
    nodeId: string,
  ): GraphNodeAnchor {
    const anchor = layout.nodeAnchors.find((candidate) => candidate.id === nodeId);

    if (anchor === undefined) {
      throw new Error(`Expected anchor '${nodeId}' to exist in test layout.`);
    }

    return anchor;
  }
}

describe("HierarchicalGraphValidator", () => {
  let fixture: HierarchicalTestFixture;
  let validator: HierarchicalGraphValidator;

  beforeEach(() => {
    fixture = new HierarchicalTestFixture();
    validator = fixture.createValidator();
  });

  describe("validate", () => {
    it("should accept a valid tree", () => {
      const graph = fixture.createRootWithTwoChildrenTree();

      expect(() => validator.validate(graph)).not.toThrow();
    });

    it("should accept a valid forest", () => {
      const graph = fixture.createMultipleRootsForest();

      expect(() => validator.validate(graph)).not.toThrow();
    });

    it("should reject duplicate node ids", () => {
      const graph = fixture.createGraphWithDuplicateNodeIds();

      expect(() => validator.validate(graph)).toThrowError(/Duplicate node id/);
    });

    it("should reject a node with multiple parents", () => {
      const graph = fixture.createGraphWithMultipleParents();

      expect(() => validator.validate(graph)).toThrowError(/multiple parents/i);
    });

    it("should reject a cyclic graph", () => {
      const graph = fixture.createGraphWithCycle();

      expect(() => validator.validate(graph)).toThrowError(/Cycle detected|acyclic/i);
    });
  });
});

describe("TidyTreeLayoutStrategy", () => {
  let fixture: HierarchicalTestFixture;

  beforeEach(() => {
    fixture = new HierarchicalTestFixture();
  });

  describe("name", () => {
    it("should expose a stable algorithm name", () => {
      const strategy = fixture.createStrategy();

      expect(strategy.name).toBe("HierarchicalTidyTree");
    });
  });

  describe("supports", () => {
    it("should support a hierarchical graph layout request", () => {
      const strategy = fixture.createStrategy();
      const request = fixture.createLayoutRequest(
        fixture.createRootWithTwoChildrenTree(),
      );

      expect(strategy.supports(request)).toBe(true);
    });
  });

  describe("createLayout", () => {
    it("should return an empty layout when the graph has no nodes", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createGraph([]);
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));

      expect(result.nodeAnchors).toHaveLength(0);
      expect(result.edgeConstraints).toHaveLength(0);
      expect(result.canvas).toEqual(fixture.canvas);
      expect(result.box).toEqual(fixture.box);
    });

    it("should create one anchor per graph node", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createRootWithTwoChildrenTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));

      expect(result.nodeAnchors).toHaveLength(graph.nodes.length);
    });

    it("should create one edge constraint per graph edge", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createDeepTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));

      expect(result.edgeConstraints).toHaveLength(graph.edges.length);
    });

    it("should place a single child below its parent", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createSingleRootTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));
      const root = fixture.getAnchorById(result, "root");
      const child = fixture.getAnchorById(result, "child");

      expect(child.centerY).toBeGreaterThan(root.centerY);
      expect(child.centerX).toBe(root.centerX);
    });

    it("should place sibling nodes on distinct horizontal positions", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createRootWithTwoChildrenTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));
      const root = fixture.getAnchorById(result, "root");
      const left = fixture.getAnchorById(result, "left");
      const right = fixture.getAnchorById(result, "right");

      expect(left.centerY).toBeGreaterThan(root.centerY);
      expect(right.centerY).toBeGreaterThan(root.centerY);
      expect(left.centerX).toBeLessThan(right.centerX);
      expect(left.centerX).not.toBe(right.centerX);
    });

    it("should place a deeper descendant below its parent level", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createDeepTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));
      const root = fixture.getAnchorById(result, "root");
      const child = fixture.getAnchorById(result, "child");
      const grandChild = fixture.getAnchorById(result, "grand-child");

      expect(child.centerY).toBeGreaterThan(root.centerY);
      expect(grandChild.centerY).toBeGreaterThan(child.centerY);
    });

    it("should keep all node anchors within the canvas bounds", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createMultipleRootsForest();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));
      const halfWidth = fixture.canvas.width / 2;
      const halfHeight = fixture.canvas.height / 2;

      for (const anchor of result.nodeAnchors) {
        expect(anchor.centerX).toBeGreaterThanOrEqual(-halfWidth);
        expect(anchor.centerX).toBeLessThanOrEqual(halfWidth);
        expect(anchor.centerY).toBeGreaterThanOrEqual(-halfHeight);
        expect(anchor.centerY).toBeLessThanOrEqual(halfHeight);
      }
    });

    it("should preserve canvas and box constraints in the result", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createSingleRootTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));

      expect(result.canvas).toEqual(fixture.canvas);
      expect(result.box).toEqual(fixture.box);
    });

    it("should respect configured level gap", () => {
      const strategy = fixture.createStrategy({
        levelGap: 200,
        siblingGap: 48,
        subtreeGap: 72,
      });
      const graph = fixture.createSingleRootTree();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));
      const root = fixture.getAnchorById(result, "root");
      const child = fixture.getAnchorById(result, "child");

      expect(child.centerY - root.centerY).toBe(200);
    });

    it("should separate forest roots horizontally", () => {
      const strategy = fixture.createStrategy();
      const graph = fixture.createMultipleRootsForest();
      const result = strategy.createLayout(fixture.createLayoutRequest(graph));
      const rootA = fixture.getAnchorById(result, "root-a");
      const rootB = fixture.getAnchorById(result, "root-b");

      expect(rootA.centerX).not.toBe(rootB.centerX);
    });
  });
});

describe("HierarchicalConstraintEngine", () => {
  let fixture: HierarchicalTestFixture;

  beforeEach(() => {
    fixture = new HierarchicalTestFixture();
  });

  describe("createConstraints", () => {
    it("should validate the graph before delegating to the strategy", () => {
      const engine = fixture.createConstraintEngine();
      const graph = fixture.createGraphWithMultipleParents();

      expect(() => engine.createConstraints(graph, fixture.canvas, fixture.box))
        .toThrowError(/multiple parents/i);
    });

    it("should delegate layout creation to the configured strategy", () => {
      const expectedLayout: GraphLayoutModel = {
        canvas: fixture.canvas,
        box: fixture.box,
        nodeAnchors: [
          {
            id: "root",
            payload: null,
            centerX: 0,
            centerY: 0,
          },
        ],
        edgeConstraints: [],
      };

      class StrategySpy implements IGraphLayoutStrategy {
        public readonly name = "StrategySpy";
        public supportsCallCount = 0;
        public createLayoutCallCount = 0;
        public lastRequest: GraphLayoutRequest | undefined;

        supports(_request: GraphLayoutRequest): boolean {
          this.supportsCallCount += 1;
          return true;
        }

        createLayout(request: GraphLayoutRequest): GraphLayoutModel {
          this.createLayoutCallCount += 1;
          this.lastRequest = request;
          return expectedLayout;
        }
      }

      const strategy = new StrategySpy();
      const engine = fixture.createConstraintEngine(strategy);
      const graph = fixture.createSingleRootTree();

      const result = engine.createConstraints(graph, fixture.canvas, fixture.box);

      expect(strategy.createLayoutCallCount).toBe(1);
      expect(strategy.lastRequest).toEqual({
        graph,
        canvas: fixture.canvas,
        box: fixture.box,
      });
      expect(result).toBe(expectedLayout);
    });
  });
});

describe("HierarchicalLayoutReactiveController", () => {
  let fixture: HierarchicalTestFixture;

  beforeEach(() => {
    fixture = new HierarchicalTestFixture();
  });

  describe("constructor", () => {
    it("should register itself on the host", () => {
      const host = fixture.createHostSpy();
      const controller = fixture.createController(host);

      expect(host.controllers).toContain(controller);
    });

    it("should expose the configured algorithm name", () => {
      class StrategyStub implements IGraphLayoutStrategy {
        public readonly name = "CustomHierarchicalStrategy";

        supports(_request: GraphLayoutRequest): boolean {
          return true;
        }

        createLayout(request: GraphLayoutRequest): GraphLayoutModel {
          return {
            canvas: request.canvas,
            box: request.box,
            nodeAnchors: [],
            edgeConstraints: [],
          };
        }
      }

      const host = fixture.createHostSpy();
      const controller = fixture.createController(host, new StrategyStub());

      expect(controller.algorithmName).toBe("CustomHierarchicalStrategy");
    });

    it("should expose a constraint engine", () => {
      const controller = fixture.createController();

      expect(controller.constraintEngine).toBeDefined();
    });
  });

  describe("lifecycle", () => {
    it("should allow hostConnected to execute without throwing", () => {
      const controller = fixture.createController();

      expect(() => controller.hostConnected()).not.toThrow();
    });

    it("should allow hostDisconnected to execute without throwing", () => {
      const controller = fixture.createController();

      expect(() => controller.hostDisconnected()).not.toThrow();
    });
  });
});