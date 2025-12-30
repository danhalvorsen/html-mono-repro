import { describe, it, expectTypeOf } from 'vitest';

import type { IMatrix, Matrix, Vector3 } from '@my-graphics/core-math';
import type { Vector3 as ThreeVector3 } from 'three';

import type {
  IDimensions,
  IIdentity,
  ILine,
  ILocation,
  IRectangle,
  IRadRotation,
  IRotation,
  IShape,
  IShapeBounded
} from '../src/index.js';

describe('@monorepo/types-abstract', () => {
  it('IShape method signatures match expectations', () => {
    expectTypeOf<Parameters<IShape['setLocation']>[0]>().toEqualTypeOf<Vector3>();
    expectTypeOf<ReturnType<IShape['getLocation']>>().toEqualTypeOf<ILocation>();

    expectTypeOf<ReturnType<IShape['getDimensions']>>().toEqualTypeOf<IDimensions>();
    expectTypeOf<ReturnType<IShape['getWidth']>>().toEqualTypeOf<number>();

    expectTypeOf<Parameters<IShape['setHeight']>[0]>().toEqualTypeOf<number>();
    expectTypeOf<ReturnType<IShape['setHeight']>>().toEqualTypeOf<number>();
    expectTypeOf<ReturnType<IShape['getHeight']>>().toEqualTypeOf<number>();

    expectTypeOf<ReturnType<IShape['getRotation']>>().toEqualTypeOf<Matrix>();
    expectTypeOf<Parameters<IShape['setIdentity']>[0]>().toEqualTypeOf<Matrix>();
  });

  it('IShapeBounded adds bounds', () => {
    expectTypeOf<IShapeBounded['bounds']>().toEqualTypeOf<{
      width: number;
      height: number;
    }>();
  });

  it('ILocation uses @my-graphics/core-math Vector3', () => {
    expectTypeOf<ReturnType<ILocation['getPosition']>>().toEqualTypeOf<Vector3>();
    expectTypeOf<Parameters<ILocation['setPosition']>[0]>().toEqualTypeOf<Vector3>();
  });

  it('ILine uses three.Vector3 endpoints', () => {
    expectTypeOf<ILine['po']>().toEqualTypeOf<ThreeVector3>();
    expectTypeOf<ILine['p1']>().toEqualTypeOf<ThreeVector3>();
  });

  it('IRectangle edges are ILine', () => {
    expectTypeOf<IRectangle['top']>().toEqualTypeOf<ILine>();
    expectTypeOf<IRectangle['bottom']>().toEqualTypeOf<ILine>();
    expectTypeOf<IRectangle['left']>().toEqualTypeOf<ILine>();
    expectTypeOf<IRectangle['right']>().toEqualTypeOf<ILine>();
  });

  it('IRadRotation is assignable to IRotation', () => {
    expectTypeOf<IRadRotation>().toMatchTypeOf<IRotation>();
  });

  it('IDimensions setters accept numbers', () => {
    expectTypeOf<Parameters<IDimensions['setWidth']>[0]>().toEqualTypeOf<number>();
    expectTypeOf<ReturnType<IDimensions['setWidth']>>().toEqualTypeOf<void>();
    expectTypeOf<ReturnType<IDimensions['getWidth']>>().toEqualTypeOf<number>();

    expectTypeOf<Parameters<IDimensions['setHeight']>[0]>().toEqualTypeOf<number>();
    expectTypeOf<ReturnType<IDimensions['setHeight']>>().toEqualTypeOf<void>();
    expectTypeOf<ReturnType<IDimensions['getHeight']>>().toEqualTypeOf<number>();
  });

  it('IIdentity uses @my-graphics/core-math IMatrix', () => {
    expectTypeOf<IIdentity['identity']>().toEqualTypeOf<IMatrix>();
    expectTypeOf<Parameters<IIdentity['setIdentity']>[0]>().toEqualTypeOf<IMatrix>();
    expectTypeOf<ReturnType<IIdentity['getPosition']>>().toEqualTypeOf<void>();
  });
});

