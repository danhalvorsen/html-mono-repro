// packages/Audio/core-semantic-model-shapes/src/ShapeBuilder.ts
import type { IShape } from "./IShape.js";
import type { IShapeDefinition } from "./IShapeDefinition.js";

export class ShapeBuilder {
  public create(definition: IShapeDefinition): IShape {
    return Object.freeze({
      id: definition.id,
      kind: definition.kind,
      topology: Object.freeze({
        vertices: Object.freeze([...definition.topology.vertices]),
        edges: Object.freeze([...definition.topology.edges]),
      }),
      ...(definition.properties
        ? { properties: Object.freeze([...definition.properties]) }
        : { properties: Object.freeze([]) }),
      ...(definition.relations
        ? { relations: Object.freeze([...definition.relations]) }
        : { relations: Object.freeze([]) }),
    });
  }
}