import { ISemanticAddress } from "./ISemanticAddress.js";


export class SemanticAddress implements ISemanticAddress {
  public constructor(
    public readonly domain: string,
    public readonly key: string
  ) { }
}
