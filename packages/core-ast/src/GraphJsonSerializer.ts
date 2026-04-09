import type { IGraph } from "@monorepo/core-graph";
import { GraphJsonMapper } from "./GraphJsonMapper.js";

export class GraphJsonSerializer {
  private readonly mapper: GraphJsonMapper;

  constructor(mapper: GraphJsonMapper = new GraphJsonMapper()) {
    this.mapper = mapper;
  }

  serialize(graph: IGraph): string {
    return JSON.stringify(this.mapper.toDocument(graph), null, 2);
  }
}
