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

import { D3ForceGraphLayoutStrategy } from "../D3ForceGraphLayoutStrategy.js";

type GraphInput = Parameters<IGraphConstraintEngine["createConstraints"]>[0];

class LayoutStrategyConstraintEngineAdapter implements IGraphConstraintEngine {
  constructor(private readonly layoutStrategy: IGraphLayoutStrategy) {}

  createConstraints(
    graph: GraphInput,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphConstraintModel {
    return this.layoutStrategy.createLayout({ graph, canvas, box });
  }
}

export class D3ForceLayoutReactiveController implements ReactiveController {
  readonly algorithmName: string;
  readonly sceneFactory: IGraphSvgSceneFactory;

  constructor(
    host: ReactiveControllerHost,
    strategy: IGraphLayoutStrategy = new D3ForceGraphLayoutStrategy(),
  ) {
    this.algorithmName = strategy.name;
    this.sceneFactory = new GraphSvgSceneFactory(new LayoutStrategyConstraintEngineAdapter(strategy));
    host.addController(this);
  }

  hostConnected(): void {}

  hostDisconnected(): void {}
}
