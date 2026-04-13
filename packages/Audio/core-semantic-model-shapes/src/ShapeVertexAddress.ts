import { ShapeAddressDomains, VertexAddressKey } from "./types.js";
import type { ISemanticAddress } from "@monorepo/core-semantic-model";

export class ShapeVertexAddress implements ISemanticAddress {
  public readonly domain = ShapeAddressDomains.Vertex;

  public constructor(public readonly key: VertexAddressKey) { }
}
