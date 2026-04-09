import { ShapeAddressDomains, EdgePointAddressKey } from "./types.js";  
import { ISemanticAddress } from "@monorepo/core-semantic-model";
export class ShapeEdgePointAddress implements ISemanticAddress {
  public readonly domain = ShapeAddressDomains.EdgePoint;

  public constructor(public readonly key: EdgePointAddressKey) { }
}
