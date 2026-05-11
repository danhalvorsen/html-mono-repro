import { describe, expect, it } from "vitest";
import {
  CreateServiceIdentity,
  IocResolutionError,
} from "../../src/new/index.js";
import {
  InversifyAdapterFixture,
} from "./fixtures/InversifyAdapterFixture.js";

describe("Stage 5 deterministic constructor injection", () => {
  it("resolves constructor dependencies from facade-owned descriptor metadata", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.AddTransient(fixture.UserService, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const provider = Collection.BuildServiceProvider();

    const userService = provider.GetRequiredService(fixture.UserService);

    expect(userService).toBeInstanceOf(fixture.UserService);
    expect(userService.Logger).toBeInstanceOf(fixture.ConsoleLogger);
  });

  it("supports constructor dependency metadata for symbol-backed service identities", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();
    const userServiceIdentity = CreateServiceIdentity<object>("IUserService");

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.AddTransient(userServiceIdentity, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const provider = Collection.BuildServiceProvider();

    const userService = provider.GetRequiredService(userServiceIdentity);

    expect(userService).toBeInstanceOf(fixture.UserService);
    expect((userService as InstanceType<typeof fixture.UserService>).Logger)
      .toBeInstanceOf(fixture.ConsoleLogger);
  });

  it("does not require public inject or injectable decorators", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.AddTransient(fixture.UserService, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const provider = Collection.BuildServiceProvider();
    const userService = provider.GetRequiredService(fixture.UserService);

    expect(userService.Logger).toBeInstanceOf(fixture.ConsoleLogger);
  });

  it("throws IoC resolution error when constructor dependency is missing", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.UserService, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const provider = Collection.BuildServiceProvider();

    expect(() =>
      provider.GetRequiredService(fixture.UserService),
    ).toThrow(IocResolutionError);
  });

  it("does not expose engine wording for missing constructor dependency", () => {
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
      expect((error as Error).message).not.toContain("reflect-metadata");
      expect((error as Error).message).not.toContain("design:paramtypes");
    }
  });
});