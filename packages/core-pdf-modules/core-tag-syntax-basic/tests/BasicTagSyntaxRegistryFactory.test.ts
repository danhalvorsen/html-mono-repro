import "chai/register-should";
import { describe, it } from "vitest";
import { BasicTagSyntaxIds } from "../src/index.js";
import { BasicTagSyntaxFixture } from "./fixtures/BasicTagSyntaxFixture.js";

describe("BasicTagSyntaxRegistryFactory", () => {
  const fixture = new BasicTagSyntaxFixture();

  it("should match line number syntax before compact tag syntaxes", () => {
    const registry = fixture.createRegistry();

    const result = registry.findFirst('8"-PL-39-9503-AC51-04');

    (result !== null).should.equal(true);
    result?.matched.should.equal(true);

    if (result === null || !result.matched) {
      throw new Error("Expected registry to match.");
    }

    result.match.syntaxId.should.equal(BasicTagSyntaxIds.LineNumber);
  });

  it("should match instrument syntax for known instrument function codes", () => {
    const registry = fixture.createRegistry();

    const result = registry.findFirst("39-FIC-9503A");

    (result !== null).should.equal(true);
    result?.matched.should.equal(true);

    if (result === null || !result.matched) {
      throw new Error("Expected registry to match.");
    }

    result.match.syntaxId.should.equal(BasicTagSyntaxIds.Instrument);
  });

  it("should match equipment syntax for known equipment class codes", () => {
    const registry = fixture.createRegistry();

    const result = registry.findFirst("39-HA-901A");

    (result !== null).should.equal(true);
    result?.matched.should.equal(true);

    if (result === null || !result.matched) {
      throw new Error("Expected registry to match.");
    }

    result.match.syntaxId.should.equal(BasicTagSyntaxIds.EquipmentOrValve);
  });
});