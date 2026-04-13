import { describe, expect, it, vi } from "vitest";

import { GraphInteractionStateController } from "../src/lit/GraphInteractionStateController.js";

interface InteractionStateProbe {
  state: string;
}

describe("GraphInteractionStateController missing FSM behavior", () => {
  it("should use distinct FSM states for node drag and connection-point drag", () => {
    const host = createHost();
    const controller = new GraphInteractionStateController(host);
    const probe = controller as unknown as InteractionStateProbe;

    const nodeDragAcquired = controller.tryAcquireDrag("node-drag");

    expect(nodeDragAcquired).toBe(true);
    expect(probe.state).toBe("dragging-node");

    controller.releaseDrag("node-drag");

    const connectionDragAcquired = controller.tryAcquireDrag("connection-point-drag");

    expect(connectionDragAcquired).toBe(true);
    expect(probe.state).toBe("dragging-connection");
  });
});

function createHost() {
  return {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  };
}
