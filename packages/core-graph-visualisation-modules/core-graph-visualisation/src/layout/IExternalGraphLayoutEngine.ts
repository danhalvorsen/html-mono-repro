import type { GraphLayoutModel, GraphLayoutRequest } from "./GraphLayoutTypes.js";

export interface IExternalGraphLayoutEngine<TPayload = unknown> {
  layout(request: GraphLayoutRequest): GraphLayoutModel<TPayload>;
}
