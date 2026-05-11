import { describe, expect, it } from "vitest";
import * as PublicApi from "../../src/new/index.js";
import {
  FacadeBoundaryFixture,
} from "./fixtures/FacadeBoundaryFixture.js";

describe("Slice 3 public facade boundary", () => {
  it("exports the default composition builder through the facade", () => {
    expect(typeof PublicApi.CreateDefaultContainerBuilder).toBe("function");
  });

  it("does not export Inversify adapter types from the public facade", () => {
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InversifyContainerAdapter")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InversifyDescriptorBinder")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InversifyServiceProvider")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InversifyServiceScope")).toBe(false);
  });

  it("does not export legacy engine decorators from the public facade", () => {
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "Inject")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "Injectable")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "Optional")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "InjectionDecorators")).toBe(false);
  });

  it("does not export legacy token concepts from the public facade", () => {
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "Token")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "TokenHasher")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(PublicApi, "ContainerAdapter")).toBe(false);
  });

  it("default builder resolves services without application code importing adapter or engine", () => {
    const fixture = new FacadeBoundaryFixture();
    const builder = fixture.createDefaultBuilder();

    builder.Services.AddSingleton(fixture.LoggerContract, fixture.ConsoleLogger);

    const provider = builder.Services.BuildServiceProvider();
    const logger = provider.GetRequiredService(fixture.LoggerContract);

    logger.Log("facade");

    expect(logger).toBeInstanceOf(fixture.ConsoleLogger);
    expect(logger.Messages).toEqual(["facade"]);
  });

  it("default builder is immutable", () => {
    const fixture = new FacadeBoundaryFixture();
    const builder = fixture.createDefaultBuilder();

    expect(Object.isFrozen(builder)).toBe(true);
  });
});