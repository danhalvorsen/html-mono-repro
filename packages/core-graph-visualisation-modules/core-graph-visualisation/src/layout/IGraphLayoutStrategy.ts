import type { GraphLayoutModel, GraphLayoutRequest } from "./GraphLayoutTypes.js";

export interface IGraphLayoutStrategy<TPayload = unknown> {
  readonly name: string;

  supports(request: GraphLayoutRequest): boolean;

  createLayout(request: GraphLayoutRequest): GraphLayoutModel<TPayload>;
}
