// MonoRepro/packages/NewShapeThreeJS/core-shapes-threejs/Tests/Fixtures/TypeFixture.ts
import { expectTypeOf } from "vitest";

/**
 * Small, DRY wrapper around expectTypeOf for contract tests.
 * Keeps tests short and consistent.
 */
export class TypeFixture {
  public hasMethod<T, K extends keyof T>(
    _t: T,
    key: K,
    sig: (fn: NonNullable<T[K]>) => void
  ): void {
    void key;
    void sig;
  }

  public method0<R>(fn: () => R): void {
    expectTypeOf(fn).toEqualTypeOf<() => R>();
  }

  public method1<A, R>(fn: (a: A) => R): void {
    expectTypeOf(fn).toEqualTypeOf<(a: A) => R>();
  }
}