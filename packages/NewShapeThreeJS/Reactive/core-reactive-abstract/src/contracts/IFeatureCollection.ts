// packages/NewShapeThreeJS/Shape/core-shapes-abstract/src/IFeatureCollection.ts

import type { IReactiveController } from "@monorepo/core-reactive-abstract";

export interface IFeatureCollection<THost> {
  add(feature: IReactiveController<THost>): void;
  remove(feature: IReactiveController<THost>): void;

  has(feature: IReactiveController<THost>): boolean;

  getAll(): ReadonlyArray<IReactiveController<THost>>;
}