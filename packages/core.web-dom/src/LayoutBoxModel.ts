import { IThickness } from "./IThickness.js";

export class LayoutBoxModel {
  public constructor(
    public readonly margin: IThickness,
    public readonly padding: IThickness,
    public readonly border: IThickness,
    
  ) {}
}
