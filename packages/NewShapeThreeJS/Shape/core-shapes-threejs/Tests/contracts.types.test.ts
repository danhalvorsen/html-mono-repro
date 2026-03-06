import { describe, it, expectTypeOf } from "vitest";
import type {
  IControllerHost,
  IReactiveShapeController
} from "@monorepo/core-reactive-abstract";
import type { IDrawableShape, ShapeId, ShapeType } from "@monorepo/core-shapes-abstract";
import type { Object3D, Scene } from "three";

import type {
  IThreeDrawContext,
  IThreeObjectProvider,
  IThreeShape,
  IThreeShapeFactory,
  ThreeShapeOptions
} from '../src/index.js'

describe("core-shapes-threejs contracts (type-level)", () => {
  it("IThreeDrawContext requires scene", () => {
    expectTypeOf<IThreeDrawContext>().toHaveProperty("scene");
    expectTypeOf<IThreeDrawContext["scene"]>().toEqualTypeOf<Scene>();
  });

  it("IThreeObjectProvider requires getObject3D(): Object3D", () => {
    expectTypeOf<IThreeObjectProvider>().toHaveProperty("getObject3D");
    expectTypeOf<IThreeObjectProvider["getObject3D"]>().toEqualTypeOf<() => Object3D>();
  });

  it("IThreeShape extends drawable + controller host + object provider", () => {
    type Drawable = IDrawableShape<IThreeDrawContext>;
    type Host = IControllerHost<IThreeShape>;
    type Provider = IThreeObjectProvider;

    expectTypeOf<IThreeShape>().toMatchTypeOf<Drawable>();
    expectTypeOf<IThreeShape>().toMatchTypeOf<Host>();
    expectTypeOf<IThreeShape>().toMatchTypeOf<Provider>();

    expectTypeOf<IThreeShape["id"]>().toEqualTypeOf<ShapeId>();
    expectTypeOf<IThreeShape["type"]>().toEqualTypeOf<ShapeType>();
    expectTypeOf<IThreeShape["draw"]>().toEqualTypeOf<(ctx: IThreeDrawContext) => void>();
    expectTypeOf<IThreeShape["addController"]>()
      .toEqualTypeOf<(controller: IReactiveShapeController<IThreeShape>) => void>();
    expectTypeOf<IThreeShape["removeController"]>()
      .toEqualTypeOf<(controller: IReactiveShapeController<IThreeShape>) => void>();
    expectTypeOf<IThreeShape["requestUpdate"]>().toEqualTypeOf<() => void>();
    expectTypeOf<IThreeShape["updateIfNeeded"]>().toEqualTypeOf<() => boolean>();
    expectTypeOf<IThreeShape["controllerCount"]>().toEqualTypeOf<number>();
    expectTypeOf<IThreeShape["isDirty"]>().toEqualTypeOf<boolean>();
    expectTypeOf<IThreeShape["dispose"]>().toEqualTypeOf<() => void>();
    expectTypeOf<IThreeShape["getObject3D"]>().toEqualTypeOf<() => Object3D>();
  });

  it("ThreeShapeOptions contains id, type and object3D", () => {
    expectTypeOf<ThreeShapeOptions["id"]>().toEqualTypeOf<ShapeId>();
    expectTypeOf<ThreeShapeOptions["type"]>().toEqualTypeOf<ShapeType>();
    expectTypeOf<ThreeShapeOptions["object3D"]>().toEqualTypeOf<Object3D>();
  });

  it("IThreeShapeFactory creates IThreeShape", () => {
    expectTypeOf<IThreeShapeFactory["create"]>()
      .toEqualTypeOf<(type: string, object3D: Object3D) => IThreeShape>();
  });
});