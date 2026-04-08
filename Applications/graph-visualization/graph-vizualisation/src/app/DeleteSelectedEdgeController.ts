import type { IDagGraph } from "@monorepo/core-graph";
import type {
  GraphElementControllerHost,
  IGraphElementController,
} from "@monorepo/core-graph-visualisation";

import type { IControllerActivityState } from "./ControllerActivityState.js";

interface IDagGraphInternalAccess {
  readonly dasInner?: {
    edgesInternal: Array<{
      source: { id: string };
      target: { id: string };
    }>;
  };
}

export class DeleteSelectedEdgeController implements IGraphElementController {
  private host: GraphElementControllerHost | undefined;

  private readonly onKeyDown = (event: Event): void => {
    const keyEvent = event as Event & { key?: unknown };

    if (keyEvent.key !== "Delete") {
      return;
    }

    this.deleteSelectedEdge();
  };

  constructor(
    private readonly graph: IDagGraph,
    private readonly activityState: IControllerActivityState,
    private readonly keyboardTarget: EventTarget = window,
  ) {}

  bind(host: GraphElementControllerHost): void {
    this.host = host;
  }

  hostConnected(): void {
    this.keyboardTarget.addEventListener("keydown", this.onKeyDown as EventListener);
  }

  hostDisconnected(): void {
    this.keyboardTarget.removeEventListener("keydown", this.onKeyDown as EventListener);
  }

  private deleteSelectedEdge(): void {
    const selectedEdgeId = this.host?.getHighlightedEdgeId();

    if (selectedEdgeId === undefined || this.host === undefined) {
      this.activityState.setActive(
        "DeleteSelectedEdgeController",
        "Delete ignored: no selected edge.",
      );
      return;
    }

    const selectedEdge = this.host.getScene().edges.find((edge) => edge.id === selectedEdgeId);

    if (selectedEdge === undefined) {
      this.activityState.setActive(
        "DeleteSelectedEdgeController",
        `Delete ignored: selected edge '${selectedEdgeId}' is not in current scene.`,
      );
      return;
    }

    const sourceId = selectedEdge.start.nodeId;
    const targetId = selectedEdge.end.nodeId;
    const mutableEdges = this.getMutableEdges();

    const relationIndex = mutableEdges.findIndex((edge) =>
      edge.source.id === sourceId && edge.target.id === targetId);

    if (relationIndex < 0) {
      this.activityState.setActive(
        "DeleteSelectedEdgeController",
        `Delete ignored: relation ${sourceId} -> ${targetId} not found in graph model.`,
      );
      return;
    }

    mutableEdges.splice(relationIndex, 1);
    this.host.setHighlightedEdgeId(undefined);
    this.host.requestGraphUpdate();
    this.activityState.setActive(
      "DeleteSelectedEdgeController",
      `Deleted relation ${sourceId} -> ${targetId}.`,
    );
  }

  private getMutableEdges(): Array<{ source: { id: string }; target: { id: string } }> {
    const internal = this.graph as IDagGraph & IDagGraphInternalAccess;

    if (internal.dasInner?.edgesInternal === undefined) {
      throw new Error("DeleteSelectedEdgeController requires a DagGraph with internal edge access.");
    }

    return internal.dasInner.edgesInternal;
  }
}
