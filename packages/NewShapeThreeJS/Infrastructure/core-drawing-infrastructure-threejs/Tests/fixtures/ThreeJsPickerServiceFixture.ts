import type { IPickerService } from "NewShapeThreeJS/Infrastructure/core-drawing-infrastructure-abstract/dist/IPickerService.js";
import type { IViewport } from "NewShapeThreeJS/Infrastructure/core-drawing-infrastructure-abstract/dist/IViewport.js";
import { Object3D, PerspectiveCamera, Raycaster, Vector2 } from "three";
import type { IObjectShapeResolver } from "../../src/IObjectShapeResolver.js";
import type { IThreePickContext } from "../../src/IThreePickContext.js";
import { ThreeJsPickerService } from "../../src/ThreeJsPickerService.js";
import { ObjectShapeResolverStub } from "./ObjectShapeResolverStub.js";
import { RaycasterStub } from "./RaycasterStub.js";
import { ViewportStub } from "./ViewportStub.js";
import { TestShape } from "./TestShape.js";

export class ThreeJsPickerServiceFixture {
  public createObject3D(): Object3D {
    return new Object3D();
  }

  public createShape(id = "shape-1"): TestShape {
    return { id };
  }

  public createViewport(width = 100, height = 100): IViewport {
    return new ViewportStub(
      { x: 0, y: 0, width, height }
    );
  }

  public createCamera(): PerspectiveCamera {
    return new PerspectiveCamera(75, 1, 0.1, 1000);
  }

  public createContext(
    objects: ReadonlyArray<Object3D>,
    viewport: IViewport = this.createViewport()
  ): IThreePickContext {
    return {
      camera: this.createCamera(),
      viewport,
      objects
    };
  }

  public createResolver<TShape>(): ObjectShapeResolverStub<TShape> {
    return new ObjectShapeResolverStub<TShape>();
  }

  public createRaycaster(): RaycasterStub {
    return new RaycasterStub();
  }

  public createSut<TShape>(
    context: IThreePickContext,
    resolver: IObjectShapeResolver<TShape>,
    raycaster?: Raycaster
  ): IPickerService<TShape> {
    return new ThreeJsPickerService<TShape>(context, resolver, raycaster);
  }

  public createPoint(x = 50, y = 50): Vector2 {
    return new Vector2(x, y);
  }
}
