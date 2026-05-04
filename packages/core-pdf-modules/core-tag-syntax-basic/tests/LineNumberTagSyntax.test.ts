import "chai/register-should";
import { describe, it } from "vitest";
import { BasicTagSyntaxIds } from "../src/index.js";
import { BasicTagSyntaxFixture } from "./fixtures/BasicTagSyntaxFixture.js";

describe("LineNumberTagSyntax", () => {
  const fixture = new BasicTagSyntaxFixture();

  it("should parse line number tag", () => {
    const syntax = fixture.createLineNumberSyntax();

    const result = syntax.parse('8"-PL-39-9503-AC51-04');

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected tag to match.");
    }

    result.match.syntaxId.should.equal(BasicTagSyntaxIds.LineNumber);
    result.match.groups.size.should.equal('8"');
    result.match.groups.service.should.equal("PL");
    result.match.groups.system.should.equal("39");
    result.match.groups.lineNumber.should.equal("9503");
    result.match.groups.pipeClass.should.equal("AC51");
    result.match.groups.code.should.equal("04");
  });

  it("should parse second line number example", () => {
    const syntax = fixture.createLineNumberSyntax();

    const result = syntax.parse('2"-OT-41-8525-BC50-01');

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected tag to match.");
    }

    result.match.groups.size.should.equal('2"');
    result.match.groups.service.should.equal("OT");
    result.match.groups.system.should.equal("41");
    result.match.groups.lineNumber.should.equal("8525");
    result.match.groups.pipeClass.should.equal("BC50");
    result.match.groups.code.should.equal("01");
  });

  it("should reject compact equipment syntax", () => {
    const syntax = fixture.createLineNumberSyntax();

    const result = syntax.parse("39-GT-9537");

    result.matched.should.equal(false);
  });
});