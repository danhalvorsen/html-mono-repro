import type { IMatrix } from "@monorepo/core-math";


export type ShapeFactory<T> = (world: IMatrix) => T;
