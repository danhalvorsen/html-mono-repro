import { IShapeCollection } from "./IShapeCollection.js";
import { ICamera } from "./ICamera.js";
import { IDrawContext } from "./IDrawContext.js";
import { IRenderInvalidation } from "./IRenderInvalidation.js";
import { IViewport } from "./IViewport.js";

export interface ICanvas<TShape, TDrawContext extends IDrawContext>
  extends IShapeCollection<TShape>, IRenderInvalidation {

  readonly viewport: IViewport;
  readonly camera: ICamera;

  getDrawContext(): TDrawContext;

  render(): void;
}
