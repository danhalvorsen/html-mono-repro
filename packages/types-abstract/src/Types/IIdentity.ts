import { IMatrix } from '@my-graphics/core-math';

export interface IIdentity {
  identity: IMatrix;
  setIdentity(identity: IMatrix): void;
  getPosition(): void;
}