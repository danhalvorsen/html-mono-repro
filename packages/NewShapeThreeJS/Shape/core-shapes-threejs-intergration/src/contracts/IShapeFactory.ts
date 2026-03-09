// packages/NewShapeThreeJS/core-shapes-threejs-samples/src/contracts/IShapeFactory.ts
import type { IDrawableShape } from "@monorepo/core-new-shapes-abstract";
import type { IFactory } from "./IFactory.js";

export interface IShapeFactory<TContext> extends IFactory<IDrawableShape<TContext>> {}