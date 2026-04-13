import type { IGraphElementController, GraphElementControllerHost } from "../../../GraphElementControllers.js";
import { resolveConnectionPointDetail, resolveConnectionPointDetailByConnectionPointId } from "../NodeControllers.js";
import type { GraphConnectionPointConnectDetail } from "../GraphConnectionPointConnectDetail.js";

const CONNECTION_POINT_DRAG_OWNER_ID = "connection-point-drag";

export class GraphConnectionPointDragController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;
  private activeSourceBoxId: string | undefined;
  private activeSourceConnectionPointId: string | undefined;
  private dragPointerId: number | undefined;
  private detachMoveSubscription: (() => void) | undefined;
  private detachUpSubscription: (() => void) | undefined;

  private readonly moveHandler = (event: PointerEvent) => this.onPointerMove(event);
  private readonly upHandler = (event: PointerEvent) => this.onPointerUp(event);

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void {
    this.stopDragging();
  }

  onConnectionPointConnect(_detail: GraphConnectionPointConnectDetail): void { }

  beginConnectionPointDrag(
    boxId: string,
    connectionPointId: string,
    originalEvent: PointerEvent
  ): void {
    if (originalEvent.button !== 0) {
      return;
    }

    if (this.host === undefined) {
      throw new Error("GraphConnectionPointDragController must be bound before use.");
    }

    const detail = resolveConnectionPointDetail(this.host, boxId, connectionPointId, originalEvent);

    if (!this.host.tryAcquireDragOwner(CONNECTION_POINT_DRAG_OWNER_ID)) {
      return;
    }

    this.activeSourceBoxId = boxId;
    this.activeSourceConnectionPointId = connectionPointId;
    this.dragPointerId = originalEvent.pointerId;
    this.host.setHighlightedNodeId(detail.box.id);
    this.host.setHighlightedConnectionPointId(detail.connectionPoint.id);
    this.host.setHighlightedEdgeId(undefined);
    this.host.setHoveredConnectionPointId(connectionPointId);
    this.host.setConnectionPointEdgeDraft({
      sourceBoxId: boxId,
      sourceConnectionPointId: connectionPointId,
      sourceConnector: detail.connectionPoint.connector,
      currentConnector: detail.connectionPoint.connector,
    });
    this.detachMoveSubscription = this.host.subscribePointerMove(this.moveHandler);
    this.detachUpSubscription = this.host.subscribePointerUp(this.upHandler);
    this.host.requestGraphUpdate();
  }

  handleConnectionPointPointerEnter(
    connectionPointId: string
  ): void {
    if (this.activeSourceConnectionPointId === undefined) {
      return;
    }

    this.host?.setHoveredConnectionPointId(connectionPointId);
    this.host?.requestGraphUpdate();
  }

  handleConnectionPointPointerLeave(
    connectionPointId: string
  ): void {
    if (this.activeSourceConnectionPointId === undefined) {
      return;
    }

    if (this.host?.getHoveredConnectionPointId() !== connectionPointId) {
      return;
    }

    this.host.setHoveredConnectionPointId(undefined);
    this.host.requestGraphUpdate();
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.host === undefined || this.dragPointerId !== event.pointerId) {
      return;
    }

    const draft = this.host.getConnectionPointEdgeDraft();

    if (draft === undefined) {
      return;
    }

    this.host.setConnectionPointEdgeDraft({
      ...draft,
      currentConnector: this.host.mapClientPointToSvg(event.clientX, event.clientY),
    });
    this.host.requestGraphUpdate();
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.host === undefined
      || this.dragPointerId !== event.pointerId
      || this.activeSourceBoxId === undefined
      || this.activeSourceConnectionPointId === undefined) {
      return;
    }

    const targetConnectionPointId = this.host.getHoveredConnectionPointId();

    if (targetConnectionPointId !== undefined
      && targetConnectionPointId !== this.activeSourceConnectionPointId) {
      const sourceDetail = resolveConnectionPointDetail(
        this.host,
        this.activeSourceBoxId,
        this.activeSourceConnectionPointId,
        event
      );
      const targetDetail = resolveConnectionPointDetailByConnectionPointId(
        this.host,
        targetConnectionPointId,
        event
      );

      this.host.setHighlightedNodeId(targetDetail.box.id);
      this.host.setHighlightedConnectionPointId(targetDetail.connectionPoint.id);
      this.host.notifyConnectionPointConnect({
        sourceBox: sourceDetail.box,
        sourceConnectionPoint: sourceDetail.connectionPoint,
        targetBox: targetDetail.box,
        targetConnectionPoint: targetDetail.connectionPoint,
        scene: sourceDetail.scene,
        originalEvent: event,
      });
    }

    this.stopDragging();
    this.host.requestGraphUpdate();
  }

  private stopDragging(): void {
    this.detachMoveSubscription?.();
    this.detachUpSubscription?.();
    this.detachMoveSubscription = undefined;
    this.detachUpSubscription = undefined;
    this.host?.releaseDragOwner(CONNECTION_POINT_DRAG_OWNER_ID);
    this.host?.setConnectionPointEdgeDraft(undefined);
    this.host?.setHoveredConnectionPointId(undefined);
    this.activeSourceBoxId = undefined;
    this.activeSourceConnectionPointId = undefined;
    this.dragPointerId = undefined;
  }
}
