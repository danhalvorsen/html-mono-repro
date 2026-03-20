import { IComponent } from "../IComponent.js";


export interface IShapeComponent extends IComponent<IShapeComponent> {
  area(): number;
}
