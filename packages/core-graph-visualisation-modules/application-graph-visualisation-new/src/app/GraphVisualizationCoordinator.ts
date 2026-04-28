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