import type { IDagGraph } from "@monorepo/core-graph";
import {
  GraphSvgSceneFactory,
  GridGraphConstraintEngine,
  type GraphElementControllerHost,
  type GraphSvgScene,
} from "@monorepo/core-graph-visualisation";
import { vi } from "vitest";

interface HostFakeOptions {
  readonly graph: IDagGraph;
  readonly width?: number;
  readonly height?: number;
  readonly padding?: number;
  readonly boxWidth?: number;
  readonly boxHeight?: number;
}

export class GraphElementControllerHostFake {
  private highlightedEdgeId: string | undefined;
  private currentScene: GraphSvgScene;
  private readonly sceneFactory = new GraphSvgSceneFactory(new GridGraphConstraintEngine());
  private readonly sceneOptions: {
    width: number;
    height: number;
    padding: number;
    boxWidth: number;
    boxHeight: number;
  };

  readonly host: GraphElementControllerHost;

  constructor(private readonly options: HostFakeOptions) {
    this.sceneOptions = {
      width: options.width ?? 800,
      height: options.height ?? 600,
      padding: options.padding ?? 60,
      boxWidth: options.boxWidth ?? 120,
      boxHeight: options.boxHeight ?? 64,
    };
    this.currentScene = this.sceneFactory.createScene(this.options.graph, this.sceneOptions);

    this.host = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
      dispatchEvent: vi.fn(() => true),

      getScene: () => {
        this.currentScene = this.sceneFactory.createScene(this.options.graph, this.sceneOptions);
        return this.currentScene;
      },
      requestGraphUpdate: vi.fn(() => {
        this.currentScene = this.sceneFactory.createScene(this.options.graph, this.sceneOptions);
      }),
      mapClientPointToSvg: vi.fn((x: number, y: number) => ({ x, y })),
      setNodePositionOverride: vi.fn(),

      getHighlightedNodeId: vi.fn(() => undefined),
      setHighlightedNodeId: vi.fn(),
      getHighlightedConnectionPointId: vi.fn(() => undefined),
      setHighlightedConnectionPointId: vi.fn(),
      getHoveredConnectionPointId: vi.fn(() => undefined),
      setHoveredConnectionPointId: vi.fn(),
      getHighlightedEdgeId: vi.fn(() => this.highlightedEdgeId),
      setHighlightedEdgeId: vi.fn((value: string | undefined) => {
        this.highlightedEdgeId = value;
      }),

      getConnectionPointEdgeDraft: vi.fn(() => undefined),
      setConnectionPointEdgeDraft: vi.fn(),
      subscribePointerMove: vi.fn(() => () => {}),
      subscribePointerUp: vi.fn(() => () => {}),
      tryAcquireDragOwner: vi.fn(() => true),
      releaseDragOwner: vi.fn(),

      notifyBoxClick: vi.fn(),
      notifyBoxRightClick: vi.fn(),
      notifyConnectionPointClick: vi.fn(),
      notifyConnectionPointRightClick: vi.fn(),
      notifyConnectionPointConnect: vi.fn(),
      notifyEdgeClick: vi.fn(),
    } as unknown as GraphElementControllerHost;
  }

  setHighlightedEdge(edgeId: string | undefined): void {
    this.highlightedEdgeId = edgeId;
    this.host.setHighlightedEdgeId(edgeId);
  }

  getScene(): GraphSvgScene {
    this.currentScene = this.sceneFactory.createScene(this.options.graph, this.sceneOptions);
    return this.currentScene;
  }
}
