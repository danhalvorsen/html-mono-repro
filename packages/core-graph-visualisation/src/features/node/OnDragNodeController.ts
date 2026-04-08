import type { IGraphElementController, GraphElementControllerHost } from "../../GraphElementControllers.js";

const NODE_DRAG_OWNER_ID = "node-drag";

export class OnDragNodeController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;
  private activeNodeId: string | undefined;
  private dragPointerId: number | undefined;
  private detachMoveSubscription: (() => void) | undefined;
  private detachUpSubscription: (() => void) | undefined;
  private dragOrigin: {
    readonly pointerX: number;
    readonly pointerY: number;
    readonly centerX: number;
    readonly centerY: number;
  } |
    undefined;

  private readonly moveHandler = (event: PointerEvent) => this.onPointerMove(event);
  private readonly upHandler = (event: PointerEvent) => this.onPointerUp(event);

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void {
    this.detachPointerListeners();
  }

  beginNodeDrag(nodeId: string, event: PointerEvent): void {
    if (this.host === undefined) {
      throw new Error("OnDragNodeController must be bound before use.");
    }

    const node = this.host.getScene().nodes.find((candidate) => candidate.id === nodeId);

    if (node === undefined) {
      throw new Error(`Graph node '${nodeId}' was not found in the current scene.`);
    }

    if (!this.host.tryAcquireDragOwner(NODE_DRAG_OWNER_ID)) {
      return;
    }

    event.preventDefault();
    this.activeNodeId = nodeId;
    this.dragPointerId = event.pointerId;
    this.dragOrigin = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      centerX: node.center.x,
      centerY: node.center.y,
    };
    this.host.setHighlightedNodeId(nodeId);
    this.host.setHighlightedConnectionPointId(undefined);
    this.host.setHighlightedEdgeId(undefined);
    this.detachMoveSubscription = this.host.subscribePointerMove(this.moveHandler);
    this.detachUpSubscription = this.host.subscribePointerUp(this.upHandler);
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.host === undefined ||
      this.activeNodeId === undefined ||
      this.dragPointerId !== event.pointerId ||
      this.dragOrigin === undefined) {
      return;
    }

    const deltaX = event.clientX - this.dragOrigin.pointerX;
    const deltaY = event.clientY - this.dragOrigin.pointerY;

    this.host.setNodePositionOverride(this.activeNodeId, {
      x: this.dragOrigin.centerX + deltaX,
      y: this.dragOrigin.centerY + deltaY,
    });
    this.host.requestGraphUpdate();
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.dragPointerId !== event.pointerId) {
      return;
    }

    this.detachPointerListeners();
  }

  private detachPointerListeners(): void {
    this.detachMoveSubscription?.();
    this.detachUpSubscription?.();
    this.detachMoveSubscription = undefined;
    this.detachUpSubscription = undefined;
    this.host?.releaseDragOwner(NODE_DRAG_OWNER_ID);
    this.activeNodeId = undefined;
    this.dragPointerId = undefined;
    this.dragOrigin = undefined;
  }
}
