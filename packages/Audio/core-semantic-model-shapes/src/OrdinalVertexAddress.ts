import type { ISemanticAddress } from "@monorepo/core-semantic-model";
import { ShapeAddressDomains } from "./types.js";


export class OrdinalVertexAddress implements ISemanticAddress {
  public readonly domain = ShapeAddressDomains.Vertex;
  public readonly key: string;

  public constructor(index: number) {
    if (!Number.isInteger(index) || index < 0) {
      throw new Error("OrdinalVertexAddress index must be a non-negative integer.");
    }

    this.key = `Vertex[${index}]`;
  }
}
