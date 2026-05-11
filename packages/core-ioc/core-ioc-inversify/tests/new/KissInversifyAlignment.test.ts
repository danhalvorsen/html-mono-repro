import { describe, expect, it } from "vitest";
import {
  IocResolutionError,
} from "../../src/new/index.js";
import {
  InversifyAdapterFixture,
} from "./fixtures/InversifyAdapterFixture.js";

describe("KISS Inversify alignment", () => {
  it("does not prevalidate missing constructor dependencies before adapter build", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.UserService, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const provider = Collection.BuildServiceProvider();

    expect(Collection.IsFrozen).toBe(true);

    expect(() =>
      provider.GetRequiredService(fixture.UserService),
    ).toThrow(IocResolutionError);
  });

  it("wraps dependency resolution failure without engine terminology", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.UserService, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const provider = Collection.BuildServiceProvider();

    try {
      provider.GetRequiredService(fixture.UserService);
      throw new Error("Expected resolution to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(IocResolutionError);
      expect((error as Error).message).toContain("Service resolution failed");
      expect((error as Error).message).not.toContain("Inversify");
      expect((error as Error).message).not.toContain("binding");
      expect((error as Error).message).not.toContain("Container");
      expect((error as Error).message).not.toContain("design:paramtypes");
    }
  });
});