// packages/NewShapeThreeJS/Shape/core-shapes-threejs/Tests/Fixtures/ThreeShapeFixture.ts

import { Object3D, Scene } from "three";
import type { IReactiveShapeController } from "@monorepo/core-reactive-abstract";
import type { ShapeId, ShapeType } from "@monorepo/core-shapes-abstract";
import type { IThreeShape } from "../../src/IThreeShape.js";
import type { ThreeShapeOptions } from "../../src/index.js";
import { ThreeShape } from "../../src/ThreeShape.js";

export class FakeReactiveShapeController implements IReactiveShapeController<IThreeShape> {
  public connectedHost?: IThreeShape;
  public connectedCount = 0;
  public disconnectedCount = 0;
  public updateCount = 0;

  public hostConnected(host: IThreeShape): void {
    this.connectedHost = host;
    this.connectedCount++;
  }

  public hostDisconnected(): void {
    this.disconnectedCount++;
  }

  public hostUpdate(): void {
    this.updateCount++;
  }
}

export class ThreeShapeFixture {
  public createScene(): Scene {
    return new Scene();
  }

  public createObject3D(): Object3D {
    return new Object3D();
  }

  public createOptions(overrides?: Partial<ThreeShapeOptions>): ThreeShapeOptions {
    return {
      id: "shape-1" as ShapeId,
      type: "box" as ShapeType,
      object3D: this.createObject3D(),
      ...overrides
    };
  }

  public createShape(overrides?: Partial<ThreeShapeOptions>): IThreeShape {
    return new ThreeShape(this.createOptions(overrides));
  }

  public createController(): FakeReactiveShapeController {
    return new FakeReactiveShapeController();
  }
}