import { DagGraph } from "@monorepo/core-graph";
import {
  type GraphElementControllerHost,
  type GraphSvgScene,
} from "@monorepo/core-graph-visualisation";

import { ControllerActivityState } from "../../src/app/ControllerActivityState.js";
import { DeleteSelectedEdgeController } from "../../src/app/DeleteSelectedEdgeController.js";
import { NodeSelectionState } from "../../src/app/NodeSelectionState.js";
import { GraphElementControllerHostFake } from "../fakes/GraphElementControllerHostFake.js";
import { KeyboardTargetFake } from "../fakes/KeyboardTargetFake.js";

export interface DeleteSelectedEdgeFixture {
  readonly graph: DagGraph;
  readonly host: GraphElementControllerHost;
  readonly activityState: ControllerActivityState;
  readonly selectionState: NodeSelectionState;
  readonly keyboardTarget: EventTarget;
  readonly controller: DeleteSelectedEdgeController;
  scene(): GraphSvgScene;
  setHighlightedEdge(edgeId: string | undefined): void;
  pressDelete(): void;
  graphEdgePairs(): string[];
}

export function createDeleteSelectedEdgeFixture(): DeleteSelectedEdgeFixture {
  const graph = new DagGraph();
  const nodeA = graph.addNode("A");
  const nodeB = graph.addNode("B");
  const nodeC = graph.addNode("C");

  graph.addEdge(nodeA, nodeB);
  graph.addEdge(nodeB, nodeC);

  const hostFake = new GraphElementControllerHostFake({ graph });
  const host = hostFake.host as GraphElementControllerHost;

  const activityState = new ControllerActivityState();
  const selectionState = new NodeSelectionState();
  const keyboardTarget = new KeyboardTargetFake();
  const controller = new DeleteSelectedEdgeController(graph, activityState, keyboardTarget);

  controller.bind(host);
  controller.hostConnected();

  return {
    graph,
    host,
    activityState,
    selectionState,
    keyboardTarget,
    controller,
    scene: () => hostFake.getScene(),
    setHighlightedEdge: (edgeId: string | undefined) => {
      hostFake.setHighlightedEdge(edgeId);
    },
    pressDelete: () => {
      keyboardTarget.pressKey("Delete");
    },
    graphEdgePairs: () => graph.edges.map((edge) => `${edge.source.id}->${edge.target.id}`),
  };
}
