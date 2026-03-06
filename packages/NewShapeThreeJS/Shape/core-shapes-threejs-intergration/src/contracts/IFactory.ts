// packages/NewShapeThreeJS/core-shapes-threejs-samples/src/contracts/IFactory.ts
export interface IFactory<T> {
  make(): T;
}