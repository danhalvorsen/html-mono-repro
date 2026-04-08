import { describe, expect, it, vi } from "vitest";

import {
  GraphBoxClickController,
  GraphBoxRightClickController,
  GraphConnectionPointDragController,
  GraphConnectionPointClickController,
  GraphEdgeClickController,
  GraphElementControllerRegistry,
  OnClickConnectionPointController,
  OnClickEdgeController,
  OnClickNodeController,
  OnEdgeClickHighlightController,
  type GraphElementControllerHost,
  type IGraphElementController,
} from "../src/GraphElementControllers.js";
import type { GraphSvgScene } from "../src/GraphSvgScene.js";

describe("GraphElementControllerRegistry", () => {
  it("should bind and add a controller to the host", () => {
    const host = createHost();
    const bind = vi.fn();
    const controller: IGraphElementController = {
      bind,
      hostConnected() {},
      hostDisconnected() {},
    };

    const registry = new GraphElementControllerRegistry(host);

    registry.add(controller);

    expect(bind).toHaveBeenCalledWith(host);
    expect(host.addController).toHaveBeenCalledWith(controller);
  });
});

describe("GraphBoxClickController", () => {
  it("should notify the host for the selected box", () => {
    const host = createHost();
    const controller = new GraphBoxClickController();
    const originalEvent = { type: "click" } as MouseEvent;

    controller.bind(host);
    controller.handleBoxClick("node-a", originalEvent);

    expect(host.notifyBoxClick).toHaveBeenCalledTimes(1);
    const detail = host.notifyBoxClick.mock.calls[0]?.[0];
    expect(detail.box.id).toBe("node-a");
    expect(detail.originalEvent).toBe(originalEvent);
  });
});

describe("GraphBoxRightClickController", () => {
  it("should notify the host for the selected box", () => {
    const host = createHost();
    const controller = new GraphBoxRightClickController();
    const originalEvent = { type: "contextmenu" } as MouseEvent;

    controller.bind(host);
    controller.handleBoxRightClick("node-a", originalEvent);

    expect(host.notifyBoxRightClick).toHaveBeenCalledTimes(1);
    const detail = host.notifyBoxRightClick.mock.calls[0]?.[0];
    expect(detail.box.id).toBe("node-a");
    expect(detail.originalEvent).toBe(originalEvent);
  });
});

describe("GraphEdgeClickController", () => {
  it("should notify the host for the selected edge", () => {
    const host = createHost();
    const controller = new GraphEdgeClickController();
    const originalEvent = { type: "click" } as MouseEvent;

    controller.bind(host);
    controller.handleEdgeClick("edge-a", originalEvent);

    expect(host.notifyEdgeClick).toHaveBeenCalledTimes(1);
    const detail = host.notifyEdgeClick.mock.calls[0]?.[0];
    expect(detail.edge.id).toBe("edge-a");
    expect(detail.originalEvent).toBe(originalEvent);
  });
});

describe("GraphConnectionPointClickController", () => {
  it("should notify the host for the selected connection point", () => {
    const host = createHost();
    const controller = new GraphConnectionPointClickController();
    const originalEvent = { type: "click" } as MouseEvent;

    controller.bind(host);
    controller.handleConnectionPointClick("node-a", "node-a-right", originalEvent);

    expect(host.notifyConnectionPointClick).toHaveBeenCalledTimes(1);
    const detail = host.notifyConnectionPointClick.mock.calls[0]?.[0];
    expect(detail.box.id).toBe("node-a");
    expect(detail.connectionPoint.id).toBe("node-a-right");
  });
});

describe("OnEdgeClickHighlightController", () => {
  it("should highlight the clicked edge", () => {
    const host = createHost();
    const controller = new OnEdgeClickHighlightController();

    controller.bind(host);
    controller.onEdgeClick({
      edge: host.getScene().edges[0]!,
      scene: host.getScene(),
      originalEvent: { type: "click" } as MouseEvent,
    });

    expect(host.setHighlightedEdgeId).toHaveBeenCalledWith("edge-a");
    expect(host.setHighlightedNodeId).toHaveBeenCalledWith(undefined);
    expect(host.requestGraphUpdate).toHaveBeenCalledTimes(1);
  });
});

describe("OnClickNodeController", () => {
  it("should highlight the clicked node and clear edge highlight", () => {
    const host = createHost();
    const controller = new OnClickNodeController();

    controller.bind(host);
    controller.onBoxClick({
      box: host.getScene().nodes[0]!,
      scene: host.getScene(),
      originalEvent: { type: "click" } as MouseEvent,
    });

    expect(host.setHighlightedNodeId).toHaveBeenCalledWith("node-a");
    expect(host.setHighlightedEdgeId).toHaveBeenCalledWith(undefined);
    expect(host.requestGraphUpdate).toHaveBeenCalledTimes(1);
  });
});

describe("OnClickConnectionPointController", () => {
  it("should highlight the selected connection point", () => {
    const host = createHost();
    const controller = new OnClickConnectionPointController();

    controller.bind(host);
    controller.onConnectionPointClick({
      box: host.getScene().nodes[0]!,
      connectionPoint: host.getScene().nodes[0]!.connectionPoints[1]!,
      scene: host.getScene(),
      originalEvent: { type: "click" } as MouseEvent,
    });

    expect(host.setHighlightedNodeId).toHaveBeenCalledWith("node-a");
    expect(host.setHighlightedConnectionPointId).toHaveBeenCalledWith("node-a-right");
    expect(host.setHighlightedEdgeId).toHaveBeenCalledWith(undefined);
    expect(host.requestGraphUpdate).toHaveBeenCalledTimes(1);
  });
});

describe("GraphConnectionPointDragController", () => {
  it("should create a connection request when a draft ends on another connection point", () => {
    const host = createHost();
    const controller = new GraphConnectionPointDragController();

    controller.bind(host);
    controller.beginConnectionPointDrag("node-a", "node-a-right", {
      button: 0,
      pointerId: 7,
    } as PointerEvent);
    controller.handleConnectionPointPointerEnter("node-b-left");
    host.emitPointerUp({
      pointerId: 7,
    } as PointerEvent);

    expect(host.setConnectionPointEdgeDraft).toHaveBeenCalled();
    expect(host.notifyConnectionPointConnect).toHaveBeenCalledTimes(1);
    const detail = host.notifyConnectionPointConnect.mock.calls[0]?.[0];
    expect(detail.sourceConnectionPoint.id).toBe("node-a-right");
    expect(detail.targetConnectionPoint.id).toBe("node-b-left");
  });
});

describe("OnClickEdgeController", () => {
  it("should highlight the clicked edge and clear node highlight", () => {
    const host = createHost();
    const controller = new OnClickEdgeController();

    controller.bind(host);
    controller.onEdgeClick({
      edge: host.getScene().edges[0]!,
      scene: host.getScene(),
      originalEvent: { type: "click" } as MouseEvent,
    });

    expect(host.setHighlightedEdgeId).toHaveBeenCalledWith("edge-a");
    expect(host.setHighlightedNodeId).toHaveBeenCalledWith(undefined);
    expect(host.requestGraphUpdate).toHaveBeenCalledTimes(1);
  });
});

function createHost(): GraphElementControllerHost & {
  addController: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  emitPointerMove: (event: PointerEvent) => void;
  emitPointerUp: (event: PointerEvent) => void;
} {
  let hoveredConnectionPointId: string | undefined;
  let connectionPointEdgeDraft: unknown;
  let activeDragOwnerId: string | undefined;
  const pointerMoveListeners = new Set<(event: PointerEvent) => void>();
  const pointerUpListeners = new Set<(event: PointerEvent) => void>();
  const scene: GraphSvgScene = {
    width: 100,
    height: 100,
    boundary: {
      topLeft: { x: 0, y: 0 },
      width: 100,
      height: 100,
    },
    nodes: [
      {
        id: "node-a",
        label: "node-a",
        payload: undefined,
        center: { x: 50, y: 50 },
        box: {
          topLeft: { x: 40, y: 40 },
          width: 20,
          height: 20,
        },
        connectionPoints: [
          { id: "node-a-top", role: "top", connector: { x: 50, y: 40 } },
          { id: "node-a-right", role: "right", connector: { x: 60, y: 50 } },
          { id: "node-a-bottom", role: "bottom", connector: { x: 50, y: 60 } },
          { id: "node-a-left", role: "left", connector: { x: 40, y: 50 } },
        ],
      },
      {
        id: "node-b",
        label: "node-b",
        payload: undefined,
        center: { x: 90, y: 50 },
        box: {
          topLeft: { x: 80, y: 40 },
          width: 20,
          height: 20,
        },
        connectionPoints: [
          { id: "node-b-top", role: "top", connector: { x: 90, y: 40 } },
          { id: "node-b-right", role: "right", connector: { x: 100, y: 50 } },
          { id: "node-b-bottom", role: "bottom", connector: { x: 90, y: 60 } },
          { id: "node-b-left", role: "left", connector: { x: 80, y: 50 } },
        ],
      },
    ],
    edges: [
      {
        id: "edge-a",
        start: {
          nodeId: "node-a",
          connector: { x: 60, y: 50 },
        },
        edge: {
          path: "M 60 50 L 90 50",
        },
        end: {
          nodeId: "node-b",
          connector: { x: 90, y: 50 },
        },
      },
    ],
  };

  return {
    addController: vi.fn(),
    removeController: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
    getScene: () => scene,
    requestGraphUpdate: vi.fn(),
    mapClientPointToSvg: vi.fn((clientX: number, clientY: number) => ({ x: clientX, y: clientY })),
    setNodePositionOverride: vi.fn(),
    getHighlightedNodeId: vi.fn(),
    setHighlightedNodeId: vi.fn(),
    getHighlightedConnectionPointId: vi.fn(),
    setHighlightedConnectionPointId: vi.fn(),
    getHoveredConnectionPointId: vi.fn(() => hoveredConnectionPointId),
    setHoveredConnectionPointId: vi.fn((value: string | undefined) => {
      hoveredConnectionPointId = value;
    }),
    getHighlightedEdgeId: vi.fn(),
    setHighlightedEdgeId: vi.fn(),
    getConnectionPointEdgeDraft: vi.fn(() => connectionPointEdgeDraft),
    setConnectionPointEdgeDraft: vi.fn((value: unknown) => {
      connectionPointEdgeDraft = value;
    }),
    subscribePointerMove: vi.fn((listener: (event: PointerEvent) => void) => {
      pointerMoveListeners.add(listener);
      return () => {
        pointerMoveListeners.delete(listener);
      };
    }),
    subscribePointerUp: vi.fn((listener: (event: PointerEvent) => void) => {
      pointerUpListeners.add(listener);
      return () => {
        pointerUpListeners.delete(listener);
      };
    }),
    dispatchInteraction: vi.fn(async () => []),
    getInteractionContext: vi.fn(() => ({
      highlightedNodeId: undefined,
      highlightedEdgeId: undefined,
      highlightedConnectionPointId: undefined,
      activeDragOwnerId,
      draggingNodeId: undefined,
      draftEdge: undefined,
      hoveredConnectionPointId,
      hoveredConnectionPointNodeId: undefined,
      lastReleasedNodeId: undefined,
      lastConnectionRequest: undefined,
    })),
    tryAcquireDragOwner: vi.fn((ownerId: string) => {
      if (activeDragOwnerId !== undefined && activeDragOwnerId !== ownerId) {
        return false;
      }

      activeDragOwnerId = ownerId;
      return true;
    }),
    releaseDragOwner: vi.fn((ownerId: string) => {
      if (activeDragOwnerId === ownerId) {
        activeDragOwnerId = undefined;
      }
    }),
    notifyBoxClick: vi.fn(),
    notifyBoxRightClick: vi.fn(),
    notifyConnectionPointClick: vi.fn(),
    notifyConnectionPointRightClick: vi.fn(),
    notifyConnectionPointConnect: vi.fn(),
    notifyEdgeClick: vi.fn(),
    emitPointerMove: (event: PointerEvent) => {
      pointerMoveListeners.forEach((listener) => listener(event));
    },
    emitPointerUp: (event: PointerEvent) => {
      pointerUpListeners.forEach((listener) => listener(event));
    },
  };
}
