# fix-center-circle-graph-view.ps1
# Run from repo root or any child folder.
# No backup files are created. Git is your rollback.

[CmdletBinding()]
param(
    [switch] $SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Find-GitRoot {
    $current = (Resolve-Path ".").Path

    while ($true) {
        if (Test-Path (Join-Path $current ".git")) {
            return $current
        }

        $parent = Split-Path $current -Parent

        if ($parent -eq $current) {
            throw "Could not find git root from '$((Resolve-Path '.').Path)'."
        }

        $current = $parent
    }
}

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Content
    )

    $directory = Split-Path $Path -Parent

    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Read-Text {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not (Test-Path $Path)) {
        throw "Missing file: $Path"
    }

    return [System.IO.File]::ReadAllText($Path)
}

$repoRoot = Find-GitRoot
$moduleRoot = Join-Path $repoRoot "packages/core-graph-visualisation-modules/application-graph-visualisation-new"

if (-not (Test-Path $moduleRoot)) {
    throw "Missing module: $moduleRoot"
}

Write-Host "Repo:   $repoRoot"
Write-Host "Module: $moduleRoot"
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Scene wrapper: force circle nodes, remove connection points, route edges center-to-center.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/rendering/CenterCircleSceneFactory.ts") `
    -Content @'
import type { IGraph } from "@monorepo/core-graph";
import type {
  GraphSceneOptions,
  GraphSvgScene,
  IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";

export interface CenterCircleSceneFactoryOptions {
  readonly radius?: number;
}

const DEFAULT_RADIUS = 32;

export class CenterCircleSceneFactory implements IGraphSvgSceneFactory {
  private readonly radius: number;

  constructor(
    private readonly innerFactory: IGraphSvgSceneFactory,
    options: CenterCircleSceneFactoryOptions = {},
  ) {
    this.radius = options.radius ?? DEFAULT_RADIUS;
  }

  createScene(graph: IGraph, options: GraphSceneOptions): GraphSvgScene {
    const scene = this.innerFactory.createScene(graph, {
      ...options,
      nodeRepresentation: "circle",
      boxWidth: this.radius * 2,
      boxHeight: this.radius * 2,
    });

    const nodes = scene.nodes.map((node) => {
      const radius = this.radius;

      return {
        ...node,
        representation: "circle" as const,
        box: {
          ...node.box,
          topLeft: {
            x: node.center.x - radius,
            y: node.center.y - radius,
          },
          width: radius * 2,
          height: radius * 2,
        },
        circle: {
          radius,
        },
        connectionPoints: [],
      };
    });

    const nodeById = new Map(nodes.map((node) => [node.id, node] as const));

    const edges = scene.edges.map((edge) => {
      const source = nodeById.get(edge.start.nodeId);
      const target = nodeById.get(edge.end.nodeId);

      if (source === undefined || target === undefined) {
        return edge;
      }

      const start = source.center;
      const end = target.center;

      return {
        ...edge,
        start: {
          ...edge.start,
          connector: start,
        },
        edge: {
          ...edge.edge,
          path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
        },
        end: {
          ...edge.end,
          connector: end,
        },
      };
    });

    return {
      ...scene,
      nodes,
      edges,
    };
  }
}
'@

# ---------------------------------------------------------------------------
# 2. Optional geometry class: center connectors only. Build-safe, typed, no any.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/rendering/CenterCircleGraphConnectorGeometry.ts") `
    -Content @'
import type {
  GraphSvgConnector,
  GraphSvgScene,
  IGraphConnectorGeometry,
} from "@monorepo/core-graph-visualisation";

export class CenterCircleGraphConnectorGeometry implements IGraphConnectorGeometry {
  createEdgeConnector(
    from: GraphSvgScene["nodes"][number],
    _to: GraphSvgScene["nodes"][number],
  ): GraphSvgConnector {
    return from.center;
  }

  createStraightPath(from: GraphSvgConnector, to: GraphSvgConnector): string {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  createConnectionPointConnector(
    center: GraphSvgConnector,
    _width: number,
    _height: number,
    _role: string,
    _circleRadius?: number,
    _angleDegrees?: number,
  ): GraphSvgConnector {
    return center;
  }

  repositionConnectionPoint(
    _node: GraphSvgScene["nodes"][number],
    center: GraphSvgConnector,
    _role: GraphSvgScene["nodes"][number]["connectionPoints"][number]["role"],
    _angleDegrees?: number,
  ): GraphSvgConnector {
    return center;
  }
}
'@

# ---------------------------------------------------------------------------
# 3. Build-safe simple renderer files. These replace old prototype/require code.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/rendering/SimpleGraphSceneSvgRenderer.ts") `
    -Content @'
import { svg, type TemplateResult } from "lit";
import type { GraphSvgScene } from "@monorepo/core-graph-visualisation";

export function renderSimpleGraphSceneSvg(scene: GraphSvgScene): TemplateResult {
  return svg`
    <svg
      viewBox="0 0 ${scene.width} ${scene.height}"
      width=${scene.width}
      height=${scene.height}
      role="img"
      aria-label="Graph visualization"
    >
      <rect
        x=${scene.boundary.topLeft.x}
        y=${scene.boundary.topLeft.y}
        width=${scene.boundary.width}
        height=${scene.boundary.height}
        fill="#f8fbff"
        stroke="#8aa0bd"
        stroke-width="2"
      ></rect>

      ${scene.edges.map((edge) => svg`
        <path
          d=${edge.edge.path}
          fill="none"
          stroke="#365a7f"
          stroke-width="2"
        ></path>
      `)}

      ${scene.nodes.map((node) => svg`
        <g>
          <circle
            cx=${node.center.x}
            cy=${node.center.y}
            r=${node.circle?.radius ?? 32}
            fill="#1f3a5f"
            stroke="#dce6f2"
            stroke-width="2"
          ></circle>
          <text
            x=${node.center.x}
            y=${node.center.y + 4}
            text-anchor="middle"
            font-family="Segoe UI, sans-serif"
            font-size="12"
            fill="#f8fbff"
          >${node.label || node.id}</text>
        </g>
      `)}
    </svg>
  `;
}
'@

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/rendering/CenterCircleGraphVisualizerElement.ts") `
    -Content @'
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { GraphSvgScene } from "@monorepo/core-graph-visualisation";
import { renderSimpleGraphSceneSvg } from "./SimpleGraphSceneSvgRenderer.js";

@customElement("mr-core-graph-center-circle-visualizer")
export class CenterCircleGraphVisualizerElement extends LitElement {
  @property({ attribute: false })
  scene: GraphSvgScene | undefined;

  override render() {
    if (this.scene === undefined) {
      return null;
    }

    return renderSimpleGraphSceneSvg(this.scene);
  }
}
'@

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/components/SimpleGraphVisualizationCanvas.ts") `
    -Content @'
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { GraphSvgScene } from "@monorepo/core-graph-visualisation";
import "../rendering/CenterCircleGraphVisualizerElement.js";

@customElement("simple-graph-visualization-canvas")
export class SimpleGraphVisualizationCanvas extends LitElement {
  @property({ attribute: false })
  scene: GraphSvgScene | undefined;

  override render() {
    return html`
      <mr-core-graph-center-circle-visualizer
        .scene=${this.scene}
      ></mr-core-graph-center-circle-visualizer>
    `;
  }
}
'@

# ---------------------------------------------------------------------------
# 4. Active composition root: remove connection-point/DAG editor controllers.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/app/GraphVisualizationCompositionRoot.ts") `
    -Content @'
import type { IDagGraph } from "@monorepo/core-graph";
import {
  type IGraphElementController,
} from "@monorepo/core-graph-visualisation";

import {
  ApplicationGraphFactory,
  type IApplicationGraphFactory,
} from "./ApplicationGraphFactory.js";
import {
  ControllerActivityState,
  type IControllerActivityState,
} from "./ControllerActivityState.js";
import { GraphSelectionController } from "./GraphSelectionController.js";
import { NodeSelectionState, type INodeSelectionState } from "./NodeSelectionState.js";

export interface GraphVisualizationApplicationModel {
  readonly graph: IDagGraph;
  readonly selectionState: INodeSelectionState;
  readonly activityState: IControllerActivityState;
  readonly controllers: readonly IGraphElementController[];
}

export class GraphVisualizationCompositionRoot {
  constructor(
    private readonly graphFactory: IApplicationGraphFactory = new ApplicationGraphFactory(),
    private readonly selectionState: INodeSelectionState = new NodeSelectionState(),
    private readonly activityState: IControllerActivityState = new ControllerActivityState(),
  ) {}

  compose(graphOverride?: IDagGraph): GraphVisualizationApplicationModel {
    const graph = graphOverride ?? this.graphFactory.createGraph();

    return {
      graph,
      selectionState: this.selectionState,
      activityState: this.activityState,
      controllers: [
        new GraphSelectionController(this.selectionState, this.activityState),
      ],
    };
  }
}
'@

# ---------------------------------------------------------------------------
# 5. Coordinator: force circle representation and wrap every layout scene factory.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/app/GraphVisualizationCoordinator.ts") `
    -Content @'
import type { ReactiveControllerHost } from "lit";

import {
  type GraphNodeVisualRepresentation,
  type IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";

import {
  GraphVisualizationLayoutControllerRegistry,
  type IGraphVisualizationLayoutControllerRegistry,
} from "./GraphVisualizationLayoutControllerRegistry.js";
import type {
  LayoutOptionDescriptor,
  LayoutOptionId,
} from "./GraphVisualizationLayoutTypes.js";
import { CenterCircleSceneFactory } from "../rendering/CenterCircleSceneFactory.js";

interface ResizeBounds {
  readonly width: number;
  readonly height: number;
}

export interface IGraphVisualizationCoordinator {
  readonly selectedLayoutId: LayoutOptionId;
  readonly selectedNodeRepresentation: GraphNodeVisualRepresentation;
  readonly visualizerWidth: number;
  readonly visualizerHeight: number;
  readonly layoutAlgorithmName: string;
  readonly sceneFactory: IGraphSvgSceneFactory;
  readonly layoutOptions: readonly LayoutOptionDescriptor[];

  setLayout(layoutId: LayoutOptionId): void;
  setNodeRepresentation(representation: GraphNodeVisualRepresentation): void;
  resize(bounds: ResizeBounds): void;

  hostConnected(): void;
  hostDisconnected(): void;
  observeCanvas(element: HTMLElement | null): void;
}

export interface GraphVisualizationCoordinatorOptions {
  readonly host: ReactiveControllerHost;
  readonly requestHostUpdate: () => void;
  readonly registry?: IGraphVisualizationLayoutControllerRegistry;
  readonly scheduleAnimationFrame?: (callback: () => void) => void;
}

const DEFAULT_LAYOUT_ID: LayoutOptionId = "d3-force";
const FIXED_NODE_REPRESENTATION: GraphNodeVisualRepresentation = "circle";

type CoordinatorLifecycleState = "Uninitialized" | "Ready" | "Active" | "Disconnected";

export class GraphVisualizationCoordinator implements IGraphVisualizationCoordinator {
  private readonly requestHostUpdate: () => void;
  private readonly scheduleAnimationFrame: ((callback: () => void) => void) | undefined;
  private readonly registry: IGraphVisualizationLayoutControllerRegistry;
  private readonly resizeObserver: ResizeObserver | undefined;
  private readonly wrappedSceneFactoryByInnerFactory = new WeakMap<object, IGraphSvgSceneFactory>();

  private observedCanvas: HTMLElement | null = null;
  private activeLayoutId: LayoutOptionId = DEFAULT_LAYOUT_ID;
  private width = 960;
  private height = 640;
  private state: CoordinatorLifecycleState = "Uninitialized";
  private animationUpdatePending = false;

  constructor(options: GraphVisualizationCoordinatorOptions) {
    this.requestHostUpdate = options.requestHostUpdate;
    this.scheduleAnimationFrame = options.scheduleAnimationFrame;
    this.registry = options.registry ?? new GraphVisualizationLayoutControllerRegistry(options.host, {
      requestAnimationHostUpdate: () => {
        this.requestAnimationHostUpdate();
      },
    });
    this.resizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver((entries) => {
        const entry = entries[0];

        if (entry === undefined) {
          return;
        }

        this.resize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      })
      : undefined;

    const defaultLayout = this.registry.getLayout(DEFAULT_LAYOUT_ID);

    if (defaultLayout !== undefined) {
      this.activeLayoutId = defaultLayout.id;
    }

    this.state = "Ready";
  }

  get selectedLayoutId(): LayoutOptionId {
    return this.activeLayoutId;
  }

  get selectedNodeRepresentation(): GraphNodeVisualRepresentation {
    return FIXED_NODE_REPRESENTATION;
  }

  get visualizerWidth(): number {
    return this.width;
  }

  get visualizerHeight(): number {
    return this.height;
  }

  get layoutAlgorithmName(): string {
    return this.getActiveLayout().algorithmName;
  }

  get sceneFactory(): IGraphSvgSceneFactory {
    return this.getWrappedSceneFactory(this.getActiveLayout().sceneFactory);
  }

  get layoutOptions(): readonly LayoutOptionDescriptor[] {
    return this.registry.options;
  }

  setLayout(layoutId: LayoutOptionId): void {
    if (this.state === "Disconnected") {
      return;
    }

    const nextLayout = this.registry.getLayout(layoutId);

    if (nextLayout === undefined || nextLayout.id === this.activeLayoutId) {
      return;
    }

    this.registry.deactivateAll();
    nextLayout.setActive(true);
    this.activeLayoutId = nextLayout.id;
    this.requestHostUpdate();
  }

  setNodeRepresentation(_representation: GraphNodeVisualRepresentation): void {
    this.requestHostUpdate();
  }

  resize(bounds: ResizeBounds): void {
    if (this.state === "Disconnected") {
      return;
    }

    const nextWidth = Math.max(360, Math.floor(bounds.width - 4));
    const nextHeight = Math.max(320, Math.floor(bounds.height - 4));

    if (nextWidth === this.width && nextHeight === this.height) {
      return;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    this.requestHostUpdate();
  }

  hostConnected(): void {
    if (this.state === "Disconnected" || this.state === "Ready" || this.state === "Uninitialized") {
      this.state = "Active";
    }

    this.registry.deactivateAll();
    this.getActiveLayout().setActive(true);
  }

  hostDisconnected(): void {
    if (this.state === "Disconnected") {
      return;
    }

    this.state = "Disconnected";
    this.animationUpdatePending = false;
    this.registry.deactivateAll();
    this.resizeObserver?.disconnect();
    this.observedCanvas = null;
  }

  observeCanvas(element: HTMLElement | null): void {
    if (this.state === "Disconnected") {
      return;
    }

    if (this.observedCanvas === element) {
      return;
    }

    if (this.observedCanvas !== null) {
      this.resizeObserver?.unobserve(this.observedCanvas);
    }

    this.observedCanvas = element;

    if (element !== null) {
      this.resizeObserver?.observe(element);
      this.resize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    }
  }

  private getActiveLayout() {
    return this.registry.getLayout(this.activeLayoutId)
      ?? this.registry.getLayout(DEFAULT_LAYOUT_ID)
      ?? this.createGridFallback();
  }

  private createGridFallback() {
    const fallback = this.registry.options.find((option) => option.id === "grid");

    if (fallback !== undefined) {
      const layout = this.registry.getLayout(fallback.id);

      if (layout !== undefined) {
        return layout;
      }
    }

    throw new Error("GraphVisualizationCoordinator requires at least one layout registration.");
  }

  private getWrappedSceneFactory(innerFactory: IGraphSvgSceneFactory): IGraphSvgSceneFactory {
    const key = innerFactory as object;
    const cached = this.wrappedSceneFactoryByInnerFactory.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const wrapped = new CenterCircleSceneFactory(innerFactory);
    this.wrappedSceneFactoryByInnerFactory.set(key, wrapped);
    return wrapped;
  }

  private requestAnimationHostUpdate(): void {
    if (this.state === "Disconnected") {
      return;
    }

    if (this.animationUpdatePending) {
      return;
    }

    this.animationUpdatePending = true;

    const publishUpdate = () => {
      this.animationUpdatePending = false;

      if (this.state === "Disconnected") {
        return;
      }

      try {
        this.requestHostUpdate();
      }
      catch {
        // Missing host frame surface should not break coordinator state transitions.
      }
    };

    if (this.scheduleAnimationFrame !== undefined) {
      this.scheduleAnimationFrame(publishUpdate);
      return;
    }

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        publishUpdate();
      });
      return;
    }

    if (typeof setTimeout === "function") {
      setTimeout(() => {
        publishUpdate();
      }, 16);
      return;
    }

    publishUpdate();
  }
}
'@

# ---------------------------------------------------------------------------
# 6. Toolbar: remove Box/Circle picker.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/components/GraphVisualizationToolbar.ts") `
    -Content @'
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { LayoutOptionDescriptor, LayoutOptionId } from "../app/GraphVisualizationLayoutTypes.js";
import type { SourceGraphId, SourceGraphOption } from "../app/GraphVisualizationSourceGraphTypes.js";

@customElement("graph-visualization-toolbar")
export class GraphVisualizationToolbar extends LitElement {
  @property({ attribute: false })
  layoutOptions: readonly LayoutOptionDescriptor[] = [];

  @property({ type: String })
  selectedLayoutId: LayoutOptionId = "d3-force";

  @property({ type: String })
  selectedNodeRepresentation = "circle";

  @property({ attribute: false })
  sourceGraphOptions: readonly SourceGraphOption[] = [];

  @property({ type: String })
  selectedSourceGraphId: SourceGraphId = "domain";

  override render() {
    return html`
      <label class="picker" for="source-graph-picker">
        <span>Source Graph</span>
        <select id="source-graph-picker" @change=${this.onSourceGraphChanged} .value=${this.selectedSourceGraphId}>
          ${this.sourceGraphOptions.map((option) => html`
            <option value=${option.id}>${option.label}</option>
          `)}
        </select>
      </label>

      <label class="picker" for="layout-picker">
        <span>Visualisation layout</span>
        <select id="layout-picker" @change=${this.onLayoutChanged} .value=${this.selectedLayoutId}>
          ${this.layoutOptions.map((option) => html`
            <option value=${option.id}>${option.label}</option>
          `)}
        </select>
      </label>

      <span class="shape-indicator">Node shape: Circle</span>

      <slot name="toolbar-after"></slot>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }

    .picker,
    .shape-indicator {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      margin-right: 10px;
      font-size: 0.9rem;
      color: #24476f;
    }

    .picker span,
    .shape-indicator {
      font-weight: 600;
    }

    .picker select {
      appearance: none;
      border: 1px solid rgba(76, 107, 143, 0.4);
      border-radius: 10px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(235, 244, 252, 0.95) 100%);
      color: #18385a;
      font: inherit;
      padding: 8px 30px 8px 10px;
      cursor: pointer;
    }

    .shape-indicator {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 10px;
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.6);
    }

    @media (max-width: 900px) {
      .picker,
      .shape-indicator {
        width: 100%;
        justify-content: space-between;
        margin-right: 0;
      }

      .picker select {
        width: min(250px, 65%);
      }
    }
  `;

  private onSourceGraphChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    this.dispatchEvent(new CustomEvent<SourceGraphId>("source-graph-change", {
      detail: select.value as SourceGraphId,
      bubbles: true,
      composed: true,
    }));
  };

  private onLayoutChanged = (event: Event): void => {
    const select = event.target;

    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    this.dispatchEvent(new CustomEvent<LayoutOptionId>("layout-change", {
      detail: select.value as LayoutOptionId,
      bubbles: true,
      composed: true,
    }));
  };
}
'@

# ---------------------------------------------------------------------------
# 7. Canvas: accept IGraph, force circle into visualizer.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/components/GraphVisualizationCanvas.ts") `
    -Content @'
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IGraph } from "@monorepo/core-graph";
import type {
  GraphNodeVisualRepresentation,
  IGraphElementController,
  IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";

const FIXED_NODE_REPRESENTATION: GraphNodeVisualRepresentation = "circle";

@customElement("graph-visualization-canvas")
export class GraphVisualizationCanvas extends LitElement {
  @property({ attribute: false })
  graph!: IGraph;

  @property({ attribute: false })
  sceneFactory!: IGraphSvgSceneFactory;

  @property({ attribute: false })
  controllers: readonly IGraphElementController[] = [];

  @property({ type: Number })
  width = 960;

  @property({ type: Number })
  height = 640;

  @property({ type: Number })
  padding = 96;

  @property({ type: Number })
  boxWidth = 64;

  @property({ type: Number })
  boxHeight = 64;

  @property({ type: String })
  nodeRepresentation: GraphNodeVisualRepresentation = FIXED_NODE_REPRESENTATION;

  override render() {
    return html`
      <main class="canvas">
        <mr-core-graph-visualizer
          .graph=${this.graph}
          .sceneFactory=${this.sceneFactory}
          .controllers=${this.controllers}
          .width=${this.width}
          .height=${this.height}
          .padding=${this.padding}
          .boxWidth=${64}
          .boxHeight=${64}
          .nodeRepresentation=${FIXED_NODE_REPRESENTATION}
        >
          <slot></slot>
        </mr-core-graph-visualizer>
      </main>
    `;
  }

  override firstUpdated(): void {
    const canvasElement = this.getCanvasElement();

    if (canvasElement === null) {
      return;
    }

    this.dispatchEvent(new CustomEvent<HTMLElement>("graph-canvas-ready", {
      detail: canvasElement,
      bubbles: true,
      composed: true,
    }));
  }

  static override styles = css`
    :host {
      display: block;
    }

    .canvas {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 50px rgba(46, 78, 109, 0.12);
      backdrop-filter: blur(10px);
      padding: 10px;
      width: 100%;
      height: clamp(620px, 86svh, 1400px);
      overflow: hidden;
      box-sizing: border-box;
    }

    mr-core-graph-visualizer {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
    }

    @media (max-width: 900px) {
      .canvas {
        padding: 8px;
        height: clamp(500px, 86svh, 980px);
      }
    }
  `;

  getCanvasElement(): HTMLElement | null {
    const element = this.renderRoot.querySelector("main.canvas");

    return element instanceof HTMLElement ? element : null;
  }
}
'@

# ---------------------------------------------------------------------------
# 8. State/workspace: remove DAG wording and connection-point event listeners.
# ---------------------------------------------------------------------------

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/components/DagStateWebComponent.ts") `
    -Content @'
import type { IGraph } from "@monorepo/core-graph";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IControllerActivityState } from "../app/ControllerActivityState.js";
import type { INodeSelectionState } from "../app/NodeSelectionState.js";

@customElement("dag-state-web-component")
export class DagStateWebComponent extends LitElement {
  @property({ attribute: false })
  graph!: IGraph;

  @property({ attribute: false })
  selectionState!: INodeSelectionState;

  @property({ attribute: false })
  activityState!: IControllerActivityState;

  @property({ type: String })
  layoutAlgorithm = "unknown";

  private observedElement: HTMLElement | undefined;

  override render() {
    return html`
      <section class="workspace">
        <aside class="panel">
          <h2>Graph State</h2>
          <p>Nodes: <strong>${this.graph.nodes.length}</strong></p>
          <p>Edges: <strong>${this.graph.edges.length}</strong></p>
          <p>Last clicked node: <strong>${this.selectionState.selectedNodeId}</strong></p>
          <p>Active controller: <strong>${this.activityState.activeControllerName}</strong></p>
          <p>Controller activity: <strong>${this.activityState.activityMessage}</strong></p>
          <p>Layout algorithm: <strong>${this.layoutAlgorithm}</strong></p>
          <p class="hint">
            Circle-only graph view. Edges are rendered from node center to node center.
          </p>
        </aside>

        <slot name="outer-box" @slotchange=${this.onOuterBoxSlotChange}></slot>
      </section>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }

    .workspace {
      display: grid;
      grid-template-columns: clamp(190px, 18vw, 230px) minmax(0, 1fr);
      gap: 12px;
      align-items: stretch;
      width: 100%;
    }

    .panel {
      border: 1px solid rgba(76, 107, 143, 0.24);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 24px 50px rgba(46, 78, 109, 0.12);
      backdrop-filter: blur(10px);
      padding: 12px;
    }

    .panel h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
    }

    .panel p {
      margin: 0 0 8px;
      line-height: 1.35;
    }

    .hint {
      color: #4c6b8f;
      font-size: 0.95rem;
    }

    ::slotted([slot="outer-box"]) {
      display: block;
      width: 100%;
      height: 100%;
      min-width: 0;
    }

    @media (max-width: 900px) {
      .workspace {
        grid-template-columns: 1fr;
      }
    }
  `;

  override disconnectedCallback(): void {
    this.detachObservedElement();
    super.disconnectedCallback();
  }

  private onOuterBoxSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assignedElement = slot.assignedElements({ flatten: true })[0];

    this.detachObservedElement();

    if (assignedElement instanceof HTMLElement) {
      this.observedElement = assignedElement;
      this.observedElement.addEventListener("graph-box:click", this.onGraphInteraction as EventListener);
      this.observedElement.addEventListener("graph-edge:click", this.onGraphInteraction as EventListener);
    }
  };

  private onGraphInteraction = (): void => {
    queueMicrotask(() => {
      this.requestUpdate();
    });
  };

  private detachObservedElement(): void {
    if (this.observedElement === undefined) {
      return;
    }

    this.observedElement.removeEventListener("graph-box:click", this.onGraphInteraction as EventListener);
    this.observedElement.removeEventListener("graph-edge:click", this.onGraphInteraction as EventListener);
    this.observedElement = undefined;
  }
}
'@

Write-Utf8NoBom `
    -Path (Join-Path $moduleRoot "src/components/GraphVisualizationWorkspace.ts") `
    -Content @'
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IGraph } from "@monorepo/core-graph";

import type { IControllerActivityState } from "../app/ControllerActivityState.js";
import type { INodeSelectionState } from "../app/NodeSelectionState.js";
import "./DagStateWebComponent.js";

@customElement("graph-visualization-workspace")
export class GraphVisualizationWorkspace extends LitElement {
  @property({ attribute: false })
  graph!: IGraph;

  @property({ attribute: false })
  selectionState!: INodeSelectionState;

  @property({ attribute: false })
  activityState!: IControllerActivityState;

  @property({ type: String })
  layoutAlgorithm = "unknown";

  override render() {
    return html`
      <dag-state-web-component
        .graph=${this.graph}
        .selectionState=${this.selectionState}
        .activityState=${this.activityState}
        .layoutAlgorithm=${this.layoutAlgorithm}
      >
        <slot name="canvas" slot="outer-box"></slot>
      </dag-state-web-component>
    `;
  }
}
'@

# ---------------------------------------------------------------------------
# 9. Patch AppView1: remove node-shape event wiring and force 64x64 circle.
# ---------------------------------------------------------------------------

$appView1Path = Join-Path $moduleRoot "src/views/AppView1/AppView1.ts"
$appView1 = Read-Text $appView1Path

$appView1 = $appView1 -replace 'import type \{ GraphNodeVisualRepresentation \} from "@monorepo/core-graph-visualisation";\r?\n', ''
$appView1 = $appView1 -replace '\r?\n\s*@node-representation-change=\$\{this\.onNodeRepresentationChanged\}', ''
$appView1 = $appView1 -replace '\r?\n\s*\.selectedNodeRepresentation=\$\{this\.coordinator\.selectedNodeRepresentation\}', ''
$appView1 = $appView1 -replace '\.boxWidth=\$\{150\}', '.boxWidth=${64}'
$appView1 = $appView1 -replace '\.boxHeight=\$\{64\}', '.boxHeight=${64}'
$appView1 = $appView1 -replace '\.nodeRepresentation=\$\{this\.coordinator\.selectedNodeRepresentation\}', '.nodeRepresentation=${"circle"}'
$appView1 = $appView1 -replace '\r?\n\s*private onNodeRepresentationChanged = \(event: CustomEvent<GraphNodeVisualRepresentation>\): void => \{\r?\n\s*this\.coordinator\.setNodeRepresentation\(event\.detail\);\r?\n\s*\};', ''

Write-Utf8NoBom -Path $appView1Path -Content $appView1

# ---------------------------------------------------------------------------
# 10. Show result and optionally build.
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Changed files:"
git -C $repoRoot status --short -- $moduleRoot

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Running module build..."
    Push-Location $moduleRoot
    try {
        pnpm build
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "Done. Use git diff to inspect the patch."