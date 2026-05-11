import { describe, expect, it } from "vitest";
import {
  IocDuplicateDescriptorError,
} from "../../src/new/index.js";
import { IocSliceFixture } from "./fixtures/IocSliceFixture.js";

describe("Slice 1 descriptor identity", () => {
  it("generates deterministic identity for same descriptor metadata", () => {
    const fixture = new IocSliceFixture();

    const first = fixture.createCollection();
    first.Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const second = fixture.createCollection();
    second.Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const firstDescriptor = fixture.singleDescriptor(first.Collection);
    const secondDescriptor = fixture.singleDescriptor(second.Collection);

    expect(firstDescriptor.Id.Value).toBe(secondDescriptor.Id.Value);
    expect(firstDescriptor.Id.CollisionIndex).toBe(0);
    expect(secondDescriptor.Id.CollisionIndex).toBe(0);
  });

  it("generates unique internal identity for duplicate descriptors when duplicates are allowed", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);
    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const descriptors = Collection.GetDescriptors();

    expect(descriptors).toHaveLength(2);
    expect(descriptors[0]?.Id.Value).not.toBe(descriptors[1]?.Id.Value);
    expect(descriptors[0]?.Id.CollisionIndex).toBe(0);
    expect(descriptors[1]?.Id.CollisionIndex).toBe(1);
  });

  it("rejects exact duplicate descriptors when duplicate policy is reject", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollectionRejectingDuplicates();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    expect(() =>
      Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger),
    ).toThrow(IocDuplicateDescriptorError);
  });

  it("does not expose internal identity as public service identity", () => {
    const fixture = new IocSliceFixture();
    const { Collection } = fixture.createCollection();

    Collection.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const descriptor = fixture.singleDescriptor(Collection);

    expect(descriptor.ServiceType).toBe(fixture.LoggerContract);
    expect(descriptor.Id.Value).toMatch(/^ioc_[0-9a-f]{8}$/u);
    expect(descriptor.Id.Value).not.toBe("LoggerContract");
    expect(descriptor.Id.Source).toContain("LoggerContract");
    expect(descriptor.Id.Source).toContain("ConsoleLogger");
  });
});