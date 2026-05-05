// FILE: src/Game/Camera/ICamera.ts

import type { Point2 } from '@monorepo/core-math';
import type { IGameObjectSubject } from './GameObjectSubject';
import type { TimeSchdulerObserver } from './TimeSchdulerObserver';
 
export interface ICameraSize {
  readonly width: number;
  readonly height: number;
}

export interface ICameraView {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ICameraFollowTarget {
  getCurrentPoint(): Point2 | null;
}

export interface ICameraFollowTargetObserverTarget extends ICameraFollowTarget {
  subscribePosition(observer: (point: Point2) => void): () => void;
}

export type CameraObserver = (camera: ICamera) => void;

export interface ICamera extends IGameObjectSubject {
  readonly position: Point2;
  readonly viewport: ICameraSize;
  readonly world: ICameraSize;

  getView(): ICameraView;
  getViewBox(): string;

  setScheduler(scheduler?: TimeSchdulerObserver): void;
  setViewport(viewport: ICameraSize): void;
  setWorld(world: ICameraSize): void;
  setFollowTarget(target?: ICameraFollowTarget): void;

  subscribe(observer: CameraObserver): () => void;
}
