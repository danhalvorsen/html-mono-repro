import { describe, expect, it } from "vitest";
import {
  CreateServiceIdentity,
  IocInvalidServiceIdentityError,
} from "../../src/new/index.js";
import {
  IocSliceFixture,
  LoggerContract,
} from "./fixtures/IocSliceFixture.js";

describe("Stage 5 ServiceCollection constructor dependency metadata", () => {
  it("stores immutable constructor dependency metadata for implementation descriptors", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ConstructorDependencies.Dependencies).toEqual([
      fixture.LoggerContract,
    ]);
    expect(Object.isFrozen(descriptor.ConstructorDependencies)).toBe(true);
    expect(Object.isFrozen(descriptor.ConstructorDependencies.Dependencies)).toBe(true);
  });

  it("stores constructor dependencies when service and implementation differ", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();
    const userServiceIdentity = CreateServiceIdentity<object>("IUserService");

    Collection.AddTransient(userServiceIdentity, fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(userServiceIdentity);
    expect(descriptor.ImplementationType).toBe(fixture.UserService);
    expect(descriptor.ConstructorDependencies.Dependencies).toEqual([
      fixture.LoggerContract,
    ]);
  });

  it("rejects invalid constructor dependency identity", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    expect(() =>
      Collection.AddTransient(fixture.UserService, {
        Dependencies: ["ILogger" as never],
      }),
    ).toThrow(IocInvalidServiceIdentityError);
  });

  it("does not allow mutation of dependency metadata through descriptor snapshot", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.UserService, {
      Dependencies: [fixture.LoggerContract],
    });

    const descriptor = fixture.singleDescriptor(Collection);

    expect(() => {
      (descriptor.ConstructorDependencies.Dependencies as LoggerContract[]).push(
        fixture.ConsoleLogger.prototype,
      );
    }).toThrow(TypeError);

    expect(descriptor.ConstructorDependencies.Dependencies).toEqual([
      fixture.LoggerContract,
    ]);
  });
});