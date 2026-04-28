// core-graph-visualisation-hierarchical (single-file, no imports)

// ==========================
// BASE CONTRACTS (local copies to avoid imports)
// ==========================

export interface GraphNode<TPayload = unknown> {
  readonly id: string;
  readonly payload: TPayload;
}

export interface GraphEdge<TPayload = unknown> {
  readonly source: GraphNode<TPayload>;
  readonly target: GraphNode<TPayload>;
}

export interface IGraph<TPayload = unknown> {
  readonly nodes: readonly GraphNode<TPayload>[];
  readonly edges: readonly GraphEdge<TPayload>[];
}

export interface GraphCanvasConstraints {
  readonly width: number;
  readonly height: number;
  readonly padding: number;
}

export interface BoxConstraints {
  readonly width: number;
  readonly height: number;
}

export interface GraphNodeAnchor<TPayload = unknown> {
  readonly id: string;
  readonly payload: TPayload;
  readonly centerX: number;
  readonly centerY: number;
}

export interface GraphEdgeRouteConstraint {
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
}

export interface GraphLayoutModel<TPayload = unknown> {
  readonly canvas: GraphCanvasConstraints;
  readonly box: BoxConstraints;
  readonly nodeAnchors: readonly GraphNodeAnchor<TPayload>[];
  readonly edgeConstraints: readonly GraphEdgeRouteConstraint[];
}

export interface GraphLayoutRequest<TPayload = unknown> {
  readonly graph: IGraph<TPayload>;
  readonly canvas: GraphCanvasConstraints;
  readonly box: BoxConstraints;
}

export interface IGraphLayoutStrategy<TPayload = unknown> {
  readonly name: string;
  supports(request: GraphLayoutRequest<TPayload>): boolean;
  createLayout(request: GraphLayoutRequest<TPayload>): GraphLayoutModel<TPayload>;
}

export interface IGraphConstraintEngine<TPayload = unknown> {
  createConstraints(
    graph: IGraph<TPayload>,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphLayoutModel<TPayload>;
}

export interface ReactiveController {
  hostConnected(): void;
  hostDisconnected(): void;
}

export interface ReactiveControllerHost {
  addController(controller: ReactiveController): void;
  requestUpdate(): void;
}

// ==========================
// DOMAIN
// ==========================

export const HierarchicalLayoutDirection = {
  TopToBottom: "top-to-bottom",
} as const;

export type HierarchicalLayoutDirection =
  typeof HierarchicalLayoutDirection[keyof typeof HierarchicalLayoutDirection];

export interface HierarchicalSpacing {
  readonly levelGap: number;
  readonly siblingGap: number;
  readonly subtreeGap: number;
}

// ==========================
// VALIDATION
// ==========================

export interface IHierarchicalGraphValidator {
  validate(graph: IGraph): void;
}

export class HierarchicalGraphValidator implements IHierarchicalGraphValidator {
  validate(graph: IGraph): void {
    const ids = new Set<string>();

    for (const n of graph.nodes) {
      if (ids.has(n.id)) {
        throw new Error(`Duplicate node id '${n.id}'.`);
      }
      ids.add(n.id);
    }

    const parentCount = new Map<string, number>();

    for (const e of graph.edges) {
      parentCount.set(e.target.id, (parentCount.get(e.target.id) ?? 0) + 1);
    }

    for (const [id, count] of parentCount) {
      if (count > 1) {
        throw new Error(`Node '${id}' has multiple parents.`);
      }
    }

    this.ensureAcyclic(graph);
  }

  private ensureAcyclic(graph: IGraph): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const adj = new Map<string, string[]>();

    for (const n of graph.nodes) adj.set(n.id, []);
    for (const e of graph.edges) adj.get(e.source.id)?.push(e.target.id);

    const visit = (id: string) => {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(`Cycle detected at '${id}'.`);

      visiting.add(id);
      for (const next of adj.get(id) ?? []) visit(next);
      visiting.delete(id);
      visited.add(id);
    };

    for (const n of graph.nodes) visit(n.id);
  }
}

// ==========================
// ALGORITHM (Tidy Tree)
// ==========================

interface TreeNode<T = unknown> {
  readonly id: string;
  readonly payload: T;
  readonly children: TreeNode<T>[];
}

interface MeasuredNode<T = unknown> {
  readonly id: string;
  readonly payload: T;
  readonly children: readonly MeasuredNode<T>[];
  readonly width: number;
}

export interface TidyTreeOptions extends HierarchicalSpacing {}

const DEFAULT_OPTIONS: TidyTreeOptions = {
  levelGap: 120,
  siblingGap: 48,
  subtreeGap: 72,
};

export class TidyTreeLayoutStrategy implements IGraphLayoutStrategy {
  readonly name = "HierarchicalTidyTree";

  constructor(private readonly options: TidyTreeOptions = DEFAULT_OPTIONS) {}

  supports(request: GraphLayoutRequest<unknown>): boolean {
    return true;
  }

  createLayout(request: GraphLayoutRequest): GraphLayoutModel {
    const roots = this.buildForest(request.graph);

    if (roots.length === 0) {
      return {
        canvas: request.canvas,
        box: request.box,
        nodeAnchors: [],
        edgeConstraints: [],
      };
    }

    const measured = roots.map(r => this.measure(r, request.box.width));
    const totalWidth = measured.reduce((s, n) => s + n.width, 0)
      + (measured.length - 1) * this.options.subtreeGap;

    let cursor = -totalWidth / 2;
    const anchors: GraphNodeAnchor[] = [];

    for (const root of measured) {
      this.place(root, cursor, 0, request, anchors);
      cursor += root.width + this.options.subtreeGap;
    }

    return {
      canvas: request.canvas,
      box: request.box,
      nodeAnchors: this.clamp(anchors, request),
      edgeConstraints: request.graph.edges.map(e => ({
        sourceNodeId: e.source.id,
        targetNodeId: e.target.id,
      })),
    };
  }

  private buildForest(graph: IGraph): readonly TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const childrenMap = new Map<string, TreeNode[]>();
    const hasParent = new Set<string>();

    for (const n of graph.nodes) {
      nodeMap.set(n.id, { id: n.id, payload: n.payload, children: [] });
      childrenMap.set(n.id, []);
    }

    for (const e of graph.edges) {
      const parent = nodeMap.get(e.source.id)!;
      const child = nodeMap.get(e.target.id)!;
      childrenMap.get(parent.id)!.push(child);
      hasParent.add(child.id);
    }

    for (const [id, node] of nodeMap) {
      node.children.push(...childrenMap.get(id)!);
    }

    return graph.nodes
      .filter(n => !hasParent.has(n.id))
      .map(n => nodeMap.get(n.id)!);
  }

  private measure(node: TreeNode, boxWidth: number): MeasuredNode {
    if (node.children.length === 0) {
      return { ...node, children: [], width: boxWidth };
    }

    const children = node.children.map(c => this.measure(c, boxWidth));
    const width =
      children.reduce((s, c) => s + c.width, 0)
      + (children.length - 1) * this.options.siblingGap;

    return { id: node.id, payload: node.payload, children, width: Math.max(width, boxWidth) };
  }

  private place(
    node: MeasuredNode,
    left: number,
    level: number,
    request: GraphLayoutRequest,
    out: GraphNodeAnchor[],
  ): void {
    const centerX = left + node.width / 2;
    const centerY = level * this.options.levelGap;

    out.push({
      id: node.id,
      payload: node.payload,
      centerX,
      centerY,
    });

    let childLeft = left;

    for (const child of node.children) {
      this.place(child, childLeft, level + 1, request, out);
      childLeft += child.width + this.options.siblingGap;
    }
  }

  private clamp(
    anchors: readonly GraphNodeAnchor[],
    request: GraphLayoutRequest,
  ): readonly GraphNodeAnchor[] {
    const halfW = request.canvas.width / 2;
    const halfH = request.canvas.height / 2;

    return anchors.map(a => ({
      ...a,
      centerX: Math.max(-halfW, Math.min(halfW, a.centerX)),
      centerY: Math.max(-halfH, Math.min(halfH, a.centerY)),
    }));
  }
}

// ==========================
// CONSTRAINT ENGINE
// ==========================

export class HierarchicalConstraintEngine implements IGraphConstraintEngine {
  constructor(
    private readonly strategy: IGraphLayoutStrategy,
    private readonly validator: IHierarchicalGraphValidator = new HierarchicalGraphValidator(),
  ) {}

  createConstraints(
    graph: IGraph,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphLayoutModel {
    this.validator.validate(graph);
    return this.strategy.createLayout({ graph, canvas, box });
  }
}

// ==========================
// REACTIVE CONTROLLER
// ==========================

export class HierarchicalLayoutReactiveController implements ReactiveController {
  readonly algorithmName: string;
  readonly constraintEngine: IGraphConstraintEngine;

  constructor(
    host: ReactiveControllerHost,
    strategy: IGraphLayoutStrategy = new TidyTreeLayoutStrategy(),
  ) {
    this.algorithmName = strategy.name;
    this.constraintEngine = new HierarchicalConstraintEngine(strategy);
    host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void {}
}