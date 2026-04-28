import type {
  GraphLayoutModel,
  GraphLayoutRequest,
  IExternalGraphLayoutEngine,
  IGraphLayoutStrategy,
} from "@monorepo/core-graph-visualisation/layout";

export class MSAGLExternalEngineStrategy implements IGraphLayoutStrategy {
  readonly name = "MSAGLExternalEngineLayout";

  constructor(private readonly externalEngine: IExternalGraphLayoutEngine) {}

  supports(_request: GraphLayoutRequest): boolean {
    return true;
  }

  createLayout(request: GraphLayoutRequest): GraphLayoutModel {
    return this.externalEngine.layout(request);
  }
}
