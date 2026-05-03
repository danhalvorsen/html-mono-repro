import "chai/register-should";
import { describe, it } from "vitest";
import { BasicTagSyntaxIds } from "../src/index.js";
import { BasicTagSyntaxFixture } from "./fixtures/BasicTagSyntaxFixture.js";

describe("EquipmentOrValveTagSyntax", () => {
  const fixture = new BasicTagSyntaxFixture();

  it("should parse equipment tag with suffix", () => {
    const syntax = fixture.createEquipmentOrValveSyntax();

    const result = syntax.parse("39-HA-901A");

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected tag to match.");
    }

    result.match.syntaxId.should.equal(BasicTagSyntaxIds.EquipmentOrValve);
    result.match.groups.system.should.equal("39");
    result.match.groups.classCode.should.equal("HA");
    result.match.groups.sequence.should.equal("901");
    result.match.groups.suffix.should.equal("A");
  });

  it("should parse inline valve tag without suffix", () => {
    const syntax = fixture.createEquipmentOrValveSyntax();

    const result = syntax.parse("41-GT-8527");

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected tag to match.");
    }

    result.match.groups.system.should.equal("41");
    result.match.groups.classCode.should.equal("GT");
    result.match.groups.sequence.should.equal("8527");
    result.match.groups.suffix.should.equal("");
  });

  it("should reject line number syntax", () => {
    const syntax = fixture.createEquipmentOrValveSyntax();

    const result = syntax.parse('8"-PL-39-9503-AC51-04');

    result.matched.should.equal(false);
  });
});