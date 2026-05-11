import { describe, expect, it } from "vitest";
import {
  IocResolutionError,
} from "../../src/new/index.js";
import {
  InversifyAdapterFixture,
} from "./fixtures/InversifyAdapterFixture.js";

describe("Slice 2 InversifyContainerAdapter", () => {
  it("BuildServiceProvider returns facade provider and not an engine container", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const provider = Collection.BuildServiceProvider();

    expect(typeof provider.GetRequiredService).toBe("function");
    expect(typeof provider.GetService).toBe("function");
    expect(typeof provider.CreateScope).toBe("function");
    expect("bind" in provider).toBe(false);
    expect("unbind" in provider).toBe(false);
  });

  it("resolves abstract class registration", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const provider = Collection.BuildServiceProvider();
    const logger = provider.GetRequiredService(fixture.LoggerContract);

    logger.Log("hello");

    expect(logger).toBeInstanceOf(fixture.ConsoleLogger);
    expect(logger.Messages).toEqual(["hello"]);
  });

  it("singleton returns the same instance", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const provider = Collection.BuildServiceProvider();

    const first = provider.GetRequiredService(fixture.LoggerContract);
    const second = provider.GetRequiredService(fixture.LoggerContract);

    expect(first).toBe(second);
  });

  it("transient returns new instances", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.LoggerContract, fixture.ConsoleLogger);

    const provider = Collection.BuildServiceProvider();

    const first = provider.GetRequiredService(fixture.LoggerContract);
    const second = provider.GetRequiredService(fixture.LoggerContract);

    expect(first).not.toBe(second);
  });

  it("scoped returns same instance inside one scope", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddScoped(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork);

    const provider = Collection.BuildServiceProvider();
    const scope = provider.CreateScope();

    const first = scope.ServiceProvider.GetRequiredService(fixture.UnitOfWorkContract);
    const second = scope.ServiceProvider.GetRequiredService(fixture.UnitOfWorkContract);

    expect(first).toBe(second);
  });

  it("scoped returns different instances across scopes", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddScoped(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork);

    const provider = Collection.BuildServiceProvider();
    const firstScope = provider.CreateScope();
    const secondScope = provider.CreateScope();

    const first = firstScope.ServiceProvider.GetRequiredService(fixture.UnitOfWorkContract);
    const second = secondScope.ServiceProvider.GetRequiredService(fixture.UnitOfWorkContract);

    expect(first).not.toBe(second);
  });

  it("instance descriptor returns provided instance", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();
    const instance = new fixture.ConsoleLogger();

    Collection.AddSingletonInstance(fixture.LoggerContract, instance);

    const provider = Collection.BuildServiceProvider();
    const resolved = provider.GetRequiredService(fixture.LoggerContract);

    expect(resolved).toBe(instance);
  });

  it("factory descriptor receives facade provider", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();
    const logger = new fixture.ConsoleLogger();

    Collection.AddSingletonInstance(fixture.LoggerContract, logger);
    Collection.AddTransient(
      fixture.UserService,
      (provider) =>
        new fixture.UserService(
          provider.GetRequiredService(fixture.LoggerContract),
        ),
    );

    const provider = Collection.BuildServiceProvider();
    const userService = provider.GetRequiredService(fixture.UserService);

    expect(userService).toBeInstanceOf(fixture.UserService);
    expect(userService.Logger).toBe(logger);
  });

  it("GetService returns undefined for missing service", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    const provider = Collection.BuildServiceProvider();

    expect(provider.GetService(fixture.LoggerContract)).toBeUndefined();
  });

  it("GetRequiredService throws IoC error for missing service", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    const provider = Collection.BuildServiceProvider();

    expect(() =>
      provider.GetRequiredService(fixture.LoggerContract),
    ).toThrow(IocResolutionError);
  });

  it("wraps engine resolution failures behind IoC vocabulary", () => {
    const fixture = new InversifyAdapterFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(
      fixture.ExplodingService,
      () => {
        throw new Error("Inversify kernel binding failure");
      },
    );

    const provider = Collection.BuildServiceProvider();

    try {
      provider.GetRequiredService(fixture.ExplodingService);
      throw new Error("Expected resolution to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(IocResolutionError);
      expect((error as Error).message).not.toContain("Inversify");
      expect((error as Error).message).not.toContain("binding");
      expect((error as Error).message).toContain("Service resolution failed");
    }
  });
});