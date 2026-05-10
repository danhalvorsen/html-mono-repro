import { Vector2 } from '@monorepo/core-math';
import { describe, expect, it } from 'vitest';
import { Cave } from '../src/Cave.js';

describe('Cave', () => {
  it('should create a visual polygon, collision polygon, and keep reference points', () => {
    const upperPoints = [
      new Vector2(0, 10),
      new Vector2(1, 10),
    ];

    const lowerPoints = [
      new Vector2(0, -10),
      new Vector2(1, -10),
    ];

    const referencePoints = [
      new Vector2(0, 0),
      new Vector2(1, 0),
    ];

    const scene = new Cave().create({
      upperPoints,
      lowerPoints,
      referencePoints,
    });

    expect(scene.polygon.closed).toBe(true);
    expect(scene.collisionPolygon.closed).toBe(true);
    expect(scene.polygon.points).toHaveLength(5);
    expect(scene.collisionPolygon.points).toHaveLength(5);
    expect(scene.referencePoints).toHaveLength(2);
  });

  it('should allow collision polygon to use reduced points', () => {
    const upperPoints = [
      new Vector2(0, 10),
      new Vector2(1, 11),
      new Vector2(2, 10),
    ];

    const lowerPoints = [
      new Vector2(0, -10),
      new Vector2(1, -11),
      new Vector2(2, -10),
    ];

    const collisionUpperPoints = [
      new Vector2(0, 10),
      new Vector2(2, 10),
    ];

    const collisionLowerPoints = [
      new Vector2(0, -10),
      new Vector2(2, -10),
    ];

    const scene = new Cave().create({
      upperPoints,
      lowerPoints,
      referencePoints: [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)],
      collisionUpperPoints,
      collisionLowerPoints,
    });

    expect(scene.polygon.points).toHaveLength(7);
    expect(scene.collisionPolygon.points).toHaveLength(5);
  });
});
