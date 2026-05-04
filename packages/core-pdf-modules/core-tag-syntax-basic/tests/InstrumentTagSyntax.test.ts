import "chai/register-should";
import { describe, it } from "vitest";
import { BasicTagSyntaxIds } from "../src/index.js";
import { BasicTagSyntaxFixture } from "./fixtures/BasicTagSyntaxFixture.js";

describe("InstrumentTagSyntax", () => {
  const fixture = new BasicTagSyntaxFixture();

  it("should parse controller instrument tag with suffix", () => {
    const syntax = fixture.createInstrumentSyntax();

    const result = syntax.parse("39-FIC-9503A");

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected tag to match.");
    }

    result.match.syntaxId.should.equal(BasicTagSyntaxIds.Instrument);
    result.match.groups.system.should.equal("39");
    result.match.groups.functionCode.should.equal("FIC");
    result.match.groups.loopNumber.should.equal("9503");
    result.match.groups.suffix.should.equal("A");
  });

  it("should parse short instrument function", () => {
    const syntax = fixture.createInstrumentSyntax();

    const result = syntax.parse("39-HS-9503A");

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected tag to match.");
    }

    result.match.groups.functionCode.should.equal("HS");
  });

  it("should not include PCS or PSD as first tag segment", () => {
    const syntax = fixture.createInstrumentSyntax();

    syntax.parse("PCS-HS-9503A").matched.should.equal(false);
    syntax.parse("PSD-TST-9515").matched.should.equal(false);
  });
});