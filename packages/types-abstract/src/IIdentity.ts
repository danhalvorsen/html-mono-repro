import { IMatrix } from '@monorepo/core-math';

export interface IIdentity {
  identity: IMatrix;
  setIdentity(identity: IMatrix): void;
  getPosition(): void;
}
