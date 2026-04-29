import type { IDagGraph } from "@monorepo/core-graph";
import {
  type IGraphElementController,
  OnClickConnectionPointController,
  OnClickEdgeController,
  OnClickNodeController,
} from "@monorepo/core-graph-visualisation";

import {
  ApplicationGraphFactory,
  type IApplicationGraphFactory,
} from "./ApplicationGraphFactory.js";
import {
  ControllerActivityState,
  type IControllerActivityState,
} from "./ControllerActivityState.js";
import { DagConnectionPointEdgeController } from "./DagConnectionPointEdgeController.js";
import { DeleteSelectedEdgeController } from "./DeleteSelectedEdgeController.js";
import { DagNodeExpansionController } from "./DagNodeExpansionController.js";
import { GraphSelectionController } from "./GraphSelectionController.js";
import { NodeSelectionState, type INodeSelectionState } from "./NodeSelectionState.js";
import { OnEdgeClickHighlightController } from "./OnEdgeClickHighlightController.js";

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
        new OnClickNodeController(),
        new OnClickConnectionPointController(),
        new OnClickEdgeController(),
        new GraphSelectionController(this.selectionState, this.activityState),
        new DagConnectionPointEdgeController(graph, this.selectionState, this.activityState),
        new DagNodeExpansionController(graph, this.selectionState, this.activityState),
        new OnEdgeClickHighlightController(this.activityState),
        new DeleteSelectedEdgeController(graph, this.activityState),
      ],
    };
  }
}