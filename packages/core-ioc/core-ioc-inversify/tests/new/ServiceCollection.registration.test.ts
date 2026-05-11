import { describe, expect, it } from "vitest";
import {
  CreateServiceIdentity,
  IocInvalidRegistrationError,
  IocInvalidServiceIdentityError,
  ServiceLifetime,
  ServiceRegistrationKind,
} from "../../src/new/index.js";
import { IocSliceFixture, LoggerContract } from "./fixtures/IocSliceFixture.js";

describe("Slice 1 ServiceCollection registration", () => {
  it("creates singleton descriptor with service and implementation type", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(fixture.LoggerContract);
    expect(descriptor.ImplementationType).toBe(fixture.ConsoleLogger);
    expect(descriptor.Lifetime).toBe(ServiceLifetime.Singleton);
    expect(descriptor.RegistrationKind).toBe(ServiceRegistrationKind.ImplementationType);
    expect(Object.isFrozen(descriptor)).toBe(true);
  });

  it("creates scoped descriptor", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddScoped(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(fixture.UnitOfWorkContract);
    expect(descriptor.ImplementationType).toBe(fixture.SqlUnitOfWork);
    expect(descriptor.Lifetime).toBe(ServiceLifetime.Scoped);
  });

  it("creates transient descriptor", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddTransient(fixture.LoggerContract, fixture.ConsoleLogger);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(fixture.LoggerContract);
    expect(descriptor.ImplementationType).toBe(fixture.ConsoleLogger);
    expect(descriptor.Lifetime).toBe(ServiceLifetime.Transient);
  });

  it("creates singleton instance descriptor", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();
    const instance = new fixture.ConsoleLogger();

    Collection.AddSingletonInstance(fixture.LoggerContract, instance);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(fixture.LoggerContract);
    expect(descriptor.ImplementationInstance).toBe(instance);
    expect(descriptor.Lifetime).toBe(ServiceLifetime.Singleton);
    expect(descriptor.RegistrationKind).toBe(ServiceRegistrationKind.Instance);
  });

  it("creates factory descriptor", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();
    const factory = () => new fixture.ConsoleLogger();

    Collection.AddTransient(fixture.LoggerContract, factory);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(fixture.LoggerContract);
    expect(descriptor.ImplementationFactory).toBe(factory);
    expect(descriptor.Lifetime).toBe(ServiceLifetime.Transient);
    expect(descriptor.RegistrationKind).toBe(ServiceRegistrationKind.Factory);
  });

  it("supports strongly typed runtime identity for erased TypeScript interfaces", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();
    const loggerIdentity = CreateServiceIdentity<LoggerContract>("LoggerContract");

    Collection.AddSingleton(loggerIdentity, fixture.ConsoleLogger);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(loggerIdentity);
    expect(descriptor.ImplementationType).toBe(fixture.ConsoleLogger);
  });

  it("rejects string service identity", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    expect(() =>
      Collection.AddSingleton(
        "ILogger" as never,
        fixture.ConsoleLogger,
      ),
    ).toThrow(IocInvalidServiceIdentityError);
  });

  it("rejects raw symbol service identity", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    expect(() =>
      Collection.AddSingleton(
        Symbol("ILogger") as never,
        fixture.ConsoleLogger,
      ),
    ).toThrow(IocInvalidServiceIdentityError);
  });

  it("rejects self-registration for symbol-backed identity without implementation", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();
    const loggerIdentity = CreateServiceIdentity<LoggerContract>("LoggerContract");

    expect(() =>
      Collection.AddSingleton(loggerIdentity),
    ).toThrow(IocInvalidRegistrationError);
  });
});