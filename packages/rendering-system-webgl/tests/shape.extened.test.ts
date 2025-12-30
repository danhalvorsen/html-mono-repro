import { Matrix, Vector3 } from "@my-graphics/math";
import { Shape } from '../src/shape.js'
import { beforeEach, describe, expect, it } from "vitest";

describe('Shape', () => {
  let shape: Shape;
  const defaultPosition = new Vector3(1, 2, 3);
  const defaultWidth = 10;
  const defaultHeight = 20;

  beforeEach(() => {
    shape = new Shape('shape1', defaultPosition, defaultWidth, defaultHeight);
  });

  it('should return initial location correctly', () => {
    const location = shape.getLocation();
    expect(location.x).toBe(1);
    expect(location.y).toBe(2);
    expect(location.z).toBe(3);
  });

  it('should update location via setLocation()', () => {
    const newPosition = new Vector3(5, 6, 7);
    shape.setLocation(newPosition);
    const updated = shape.getLocation();
    expect(updated.x).toBe(5);
    expect(updated.y).toBe(6);
    expect(updated.z).toBe(7);
  });

  it('should update location via ILocation.setPosition()', () => {
    const location = shape.getLocation();
    const next = new Vector3(9, 8, 7);
    location.setPosition(next);
    const after = shape.getLocation();
    expect(after.x).toBe(9);
    expect(after.y).toBe(8);
    expect(after.z).toBe(7);
  });

  it('should return dimensions correctly', () => {
    const dim = shape.getDimensions();
    expect(dim.getWidth()).toBe(defaultWidth);
    expect(dim.getHeight()).toBe(defaultHeight);
  });

  it('should allow dimension mutation', () => {
    const dim = shape.getDimensions();
    dim.setWidth(99);
    dim.setHeight(101);
    expect(shape.getWidth()).toBe(99);
    expect(shape.getHeight()).toBe(101);
  });

  it('should set height directly', () => {
    const result = shape.setHeight(123);
    expect(result).toBe(123);
    expect(shape.getHeight()).toBe(123);
  });

  it('should default to identity matrix', () => {
    const rot = shape.getRotation();
    expect(rot.equals(Matrix.identity(4))).toBe(true);
  });

  it('should accept new rotation matrix', () => {
    const newMatrix = Matrix.translation(1, 2);
    shape.setIdentity(newMatrix);
    expect(shape.getRotation().equals(newMatrix)).toBe(true);
  });
});
