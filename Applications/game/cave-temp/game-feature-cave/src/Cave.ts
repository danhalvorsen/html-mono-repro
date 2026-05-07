import type { Vector2 } from '@monorepo/core-math';
import { TriangleStrip } from './TriangleStrip.js';
import type { CaveScene } from './CaveScene.js';

export interface CaveCreateOptions {
  readonly upperPoints: readonly Vector2[];
  readonly lowerPoints: readonly Vector2[];
  readonly referencePoints: readonly Vector2[];
  readonly collisionUpperPoints?: readonly Vector2[];
  readonly collisionLowerPoints?: readonly Vector2[];
}

export class Cave {
  public create(options: CaveCreateOptions): CaveScene {
    const polygon = new TriangleStrip(
      options.upperPoints,
      options.lowerPoints,
    ).create();

    const collisionPolygon = new TriangleStrip(
      options.collisionUpperPoints ?? options.upperPoints,
      options.collisionLowerPoints ?? options.lowerPoints,
    ).create();

    return {
      polygon,
      collisionPolygon,
      referencePoints: Object.freeze([...options.referencePoints]),
    };
  }
}
