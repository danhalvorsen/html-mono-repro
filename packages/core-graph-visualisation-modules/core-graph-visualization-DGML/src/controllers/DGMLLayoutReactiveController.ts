import type { ReactiveController, ReactiveControllerHost } from "lit";

import {
  GraphSvgSceneFactory,
  type BoxConstraints,
  type GraphCanvasConstraints,
  type GraphConstraintModel,
  type IGraphConstraintEngine,
  type IGraphLayoutStrategy,
  type IGraphSvgSceneFactory,
} from "@monorepo/core-graph-visualisation";
import type { IGraph } from "@monorepo/core-graph";

class LayoutStrategyConstraintEngineAdapter implements IGraphConstraintEngine {
  constructor(private readonly layoutStrategy: IGraphLayoutStrategy) {}

  createConstraints(
    graph: IGraph,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphConstraintModel {
    return this.layoutStrategy.createLayout({ graph, canvas, box });
  }
}

export class DGMLLayoutReactiveController implements ReactiveController {
  readonly algorithmName: string;
  readonly sceneFactory: IGraphSvgSceneFactory;

  constructor(
    host: ReactiveControllerHost,
    strategy: IGraphLayoutStrategy,
  ) {
    this.algorithmName = strategy.name;
    this.sceneFactory = new GraphSvgSceneFactory(new LayoutStrategyConstraintEngineAdapter(strategy));
    host.addController(this);
  }

  hostConnected(): void {}

  hostDisconnected(): void {}
}
