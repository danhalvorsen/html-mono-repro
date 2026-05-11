import { describe, expect, it } from "vitest";
import {
  IocCollectionFrozenError,
} from "../../src/new/index.js";
import { IocSliceFixture } from "./fixtures/IocSliceFixture.js";

describe("Slice 1 ServiceCollection build pipeline", () => {
  it("forwards immutable descriptors unchanged to adapter", () => {
    const fixture = new IocSliceFixture();
    const { Collection, Adapter } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const descriptorBeforeBuild = fixture.singleDescriptor(Collection);
    const provider = Collection.BuildServiceProvider();

    expect(provider).toBe(Adapter.Provider);
    expect(Adapter.RegisteredDescriptors).toHaveLength(1);
    expect(Adapter.RegisteredDescriptors[0]).toBe(descriptorBeforeBuild);
    expect(Object.isFrozen(Adapter.RegisteredDescriptors[0])).toBe(true);
  });

  it("builds provider only once", () => {
    const fixture = new IocSliceFixture();
    const { Collection, Adapter } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const firstProvider = Collection.BuildServiceProvider();
    const secondProvider = Collection.BuildServiceProvider();

    expect(firstProvider).toBe(secondProvider);
    expect(Adapter.BuildProviderCallCount).toBe(1);
    expect(Adapter.RegisteredDescriptors).toHaveLength(1);
  });

  it("freezes collection after successful build", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.BuildServiceProvider();

    expect(Collection.IsFrozen).toBe(true);
    expect(() =>
      Collection.AddTransient(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork),
    ).toThrow(IocCollectionFrozenError);
  });

  it("keeps descriptors immutable after build", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const descriptor = fixture.singleDescriptor(Collection);

    Collection.BuildServiceProvider();

    expect(() => {
      (descriptor as unknown as { Lifetime: string }).Lifetime = "Transient";
    }).toThrow(TypeError);

    expect(descriptor.Lifetime).toBe("Singleton");
  });

  it("preserves descriptor registration order", () => {
    const fixture = new IocSliceFixture();
    const { Collection, Adapter } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.AddTransient(fixture.UnitOfWorkContract, fixture.SqlUnitOfWork);

    const descriptors = Collection.GetDescriptors();

    Collection.BuildServiceProvider();

    expect(Adapter.RegisteredDescriptors[0]).toBe(descriptors[0]);
    expect(Adapter.RegisteredDescriptors[1]).toBe(descriptors[1]);
    expect(Adapter.RegisteredDescriptors[0]?.Order).toBe(0);
    expect(Adapter.RegisteredDescriptors[1]?.Order).toBe(1);
  });
});