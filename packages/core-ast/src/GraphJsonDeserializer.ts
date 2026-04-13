import type { IGraph } from "@monorepo/core-graph";
import type { GraphJsonDocument } from "./GraphJsonDocument.js";
import { GraphJsonValidator } from "./GraphJsonValidator.js";
import { GraphJsonMapper } from "./GraphJsonMapper.js";

export class GraphJsonDeserializer {
  private readonly validator: GraphJsonValidator;
  private readonly mapper: GraphJsonMapper;

  constructor(
    private readonly createGraph: () => IGraph,
    validator: GraphJsonValidator = new GraphJsonValidator(),
    mapper: GraphJsonMapper = new GraphJsonMapper(),
  ) {
    this.validator = validator;
    this.mapper = mapper;
  }

  deserialize(json: string): IGraph {
    const document = JSON.parse(json) as GraphJsonDocument;
    this.validator.validate(document);
    return this.mapper.fromDocument(document, this.createGraph());
  }
}
