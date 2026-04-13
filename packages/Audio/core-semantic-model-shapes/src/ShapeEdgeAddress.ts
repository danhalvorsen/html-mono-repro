// packages/Audio/core-semantic-model-shapes/src/ShapeEdgeAddress.ts
import type { ISemanticAddress } from "@monorepo/core-semantic-model";
import { ShapeAddressDomains, type EdgeAddressKey } from "./types.js";

export class ShapeEdgeAddress implements ISemanticAddress {
  public readonly domain = ShapeAddressDomains.Edge;

  public constructor(public readonly key: EdgeAddressKey) {}
}