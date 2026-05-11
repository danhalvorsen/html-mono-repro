import { describe, expect, it } from "vitest";
import {
  CreateServiceCollectionDiagnostics,
} from "../../src/new/index.js";
import { IocSliceFixture } from "./fixtures/IocSliceFixture.js";

describe("Slice 4 ServiceCollection diagnostics", () => {
  it("reports immutable descriptor diagnostics without engine concepts", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.AddTransient(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork);

    const diagnostics = CreateServiceCollectionDiagnostics(Collection);

    expect(diagnostics.IsFrozen).toBe(false);
    expect(diagnostics.DescriptorCount).toBe(2);
    expect(Object.isFrozen(diagnostics)).toBe(true);
    expect(Object.isFrozen(diagnostics.Descriptors)).toBe(true);

    expect(diagnostics.Descriptors[0]).toMatchObject({
      Order: 0,
      ServiceName: "LoggerContract",
      ImplementationName: "ConsoleLogger",
      Lifetime: "Singleton",
      RegistrationKind: "ImplementationType",
      CollisionIndex: 0,
    });

    expect(diagnostics.Descriptors[0]?.InternalDescriptorIdentity).toMatch(/^ioc_[0-9a-f]{8}$/u);
    expect(diagnostics.Descriptors[0]?.IdentitySource).toContain("LoggerContract");
    expect(diagnostics.Descriptors[0]?.IdentitySource).toContain("ConsoleLogger");

    const serialized = JSON.stringify(diagnostics);

    expect(serialized).not.toContain("Inversify");
    expect(serialized).not.toContain("Container");
    expect(serialized).not.toContain("Binding");
    expect(serialized).not.toContain("reflect-metadata");
    expect(serialized).not.toContain("design:paramtypes");
  });

  it("reports frozen state after BuildServiceProvider", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    expect(CreateServiceCollectionDiagnostics(Collection).IsFrozen).toBe(false);

    Collection.BuildServiceProvider();

    expect(CreateServiceCollectionDiagnostics(Collection).IsFrozen).toBe(true);
  });

  it("returns diagnostics as a snapshot", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const first = CreateServiceCollectionDiagnostics(Collection);

    Collection.AddTransient(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork);

    const second = CreateServiceCollectionDiagnostics(Collection);

    expect(first.DescriptorCount).toBe(1);
    expect(second.DescriptorCount).toBe(2);
  });
});