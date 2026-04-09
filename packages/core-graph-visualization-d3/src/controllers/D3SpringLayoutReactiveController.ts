import type { ReactiveController, ReactiveControllerHost } from "lit";

import {
  GraphSvgSceneFactory,
  type BoxConstraints,
  type GraphCanvasConstraints,
  type GraphConstraintModel,
  type IGraphConstraintEngine,
  type IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";

import {
  type ID3SpringSimulationHandle,
  SimulationD3SpringSimulation,
} from "../SimulationD3SpringSimulation.js";

type GraphInput = Parameters<IGraphConstraintEngine["createConstraints"]>[0];

export interface D3SpringLayoutReactiveControllerOptions {
  readonly strategy?: SimulationD3SpringSimulation;
  readonly onAnimationFrame?: () => void;
  readonly requestHostUpdate?: () => void;
}

class SpringSimulationConstraintEngineAdapter implements IGraphConstraintEngine {
  private session: ID3SpringSimulationHandle | undefined;
  private lastGraphSignature: string | undefined;
  private lastCanvas: GraphCanvasConstraints | undefined;
  private lastBox: BoxConstraints | undefined;

  constructor(private readonly strategy: SimulationD3SpringSimulation) {}

  createConstraints(
    graph: GraphInput,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphConstraintModel {
    const graphSignature = this.createGraphSignature(graph);

    if (this.shouldRecreateSession(graph, canvas, box, graphSignature)) {
      this.session?.dispose();
      this.session = this.strategy.createSimulation({ graph, canvas, box });
      this.lastGraphSignature = graphSignature;
      this.lastCanvas = canvas;
      this.lastBox = box;
    }

    return this.session?.tick(1) ?? this.strategy.createLayout({ graph, canvas, box });
  }

  dispose(): void {
    this.session?.dispose();
    this.session = undefined;
    this.lastGraphSignature = undefined;
    this.lastCanvas = undefined;
    this.lastBox = undefined;
  }

  private shouldRecreateSession(
    graph: GraphInput,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
    graphSignature: string,
  ): boolean {
    if (this.session === undefined) {
      return true;
    }

    if (this.lastGraphSignature !== graphSignature) {
      return true;
    }

    if (this.lastCanvas === undefined || this.lastBox === undefined) {
      return true;
    }

    return this.lastCanvas.width !== canvas.width
      || this.lastCanvas.height !== canvas.height
      || this.lastCanvas.padding !== canvas.padding
      || this.lastBox.width !== box.width
      || this.lastBox.height !== box.height;
  }

  private createGraphSignature(graph: GraphInput): string {
    const nodeIds = graph.nodes.map((node) => node.id).sort();
    const edgeIds = graph.edges
      .map((edge) => `${edge.source.id}->${edge.target.id}`)
      .sort();

    return `${nodeIds.join("|")}::${edgeIds.join("|")}`;
  }
}

export class D3SpringLayoutReactiveController implements ReactiveController {
  readonly algorithmName: string;
  readonly sceneFactory: IGraphSvgSceneFactory;

  private readonly host: ReactiveControllerHost;
  private readonly constraintEngine: SpringSimulationConstraintEngineAdapter;
  private readonly onAnimationFrame: (() => void) | undefined;
  private readonly requestHostUpdate: () => void;
  private animationFrameId: number | undefined;
  private animationTimerId: ReturnType<typeof setTimeout> | undefined;
  private active = false;

  constructor(
    host: ReactiveControllerHost,
    options: D3SpringLayoutReactiveControllerOptions = {},
  ) {
    this.host = host;
    const strategy = options.strategy ?? new SimulationD3SpringSimulation({
      settleTicks: 0,
      chargeStrength: -120,
      linkDistance: 80,
      alphaDecay: 0.0228,
      velocityDecay: 0.4,
    });
    this.algorithmName = strategy.name;
    this.constraintEngine = new SpringSimulationConstraintEngineAdapter(strategy);
    this.sceneFactory = new GraphSvgSceneFactory(this.constraintEngine);
    this.onAnimationFrame = options.onAnimationFrame;
    this.requestHostUpdate = options.requestHostUpdate ?? (() => this.host.requestUpdate());
    host.addController(this);
  }

  hostConnected(): void {
    if (this.active) {
      this.startAnimationLoop();
    }
  }

  hostDisconnected(): void {
    this.stopAnimationLoop();
    this.constraintEngine.dispose();
  }

  setActive(isActive: boolean): void {
    if (this.active === isActive) {
      return;
    }

    this.active = isActive;

    if (this.active) {
      this.startAnimationLoop();
      return;
    }

    this.stopAnimationLoop();
    this.constraintEngine.dispose();
  }

  private startAnimationLoop(): void {
    if (this.animationFrameId !== undefined || this.animationTimerId !== undefined) {
      return;
    }

    const tick = () => {
      if (!this.active) {
        this.stopAnimationLoop();
        return;
      }

      this.onAnimationFrame?.();
      this.requestHostUpdate();
      this.scheduleNextFrame(tick);
    };

    this.scheduleNextFrame(tick);
  }

  private scheduleNextFrame(tick: () => void): void {
    if (typeof requestAnimationFrame === "function") {
      this.animationFrameId = requestAnimationFrame(() => {
        this.animationFrameId = undefined;
        tick();
      });
      return;
    }

    this.animationTimerId = setTimeout(() => {
      this.animationTimerId = undefined;
      tick();
    }, 16);
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameId !== undefined && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.animationTimerId !== undefined) {
      clearTimeout(this.animationTimerId);
    }

    this.animationFrameId = undefined;
    this.animationTimerId = undefined;
  }
}
