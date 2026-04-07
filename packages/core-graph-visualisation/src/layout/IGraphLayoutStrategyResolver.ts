import type { GraphLayoutRequest } from "./GraphLayoutTypes.js";
import type { IGraphLayoutStrategy } from "./IGraphLayoutStrategy.js";

export interface IGraphLayoutStrategyResolver<TPayload = unknown> {
  resolve(request: GraphLayoutRequest): IGraphLayoutStrategy<TPayload>;
}
