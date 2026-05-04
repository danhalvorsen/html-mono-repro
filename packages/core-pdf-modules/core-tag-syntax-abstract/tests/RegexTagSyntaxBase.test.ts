import "chai/register-should";
import { describe, it } from "vitest";
import { RegexTagSyntaxBase, TagSyntaxErrorMessages } from "../src/index.js";
import { TagSyntaxAbstractFixture } from "./fixtures/TagSyntaxAbstractFixture.js";

describe("RegexTagSyntaxBase", () => {
  const fixture = new TagSyntaxAbstractFixture();

  it("should parse a matching normalized tag", () => {
    const syntax = fixture.createSampleSyntax();

    const result = syntax.parse(" 39-ha-901 ");

    result.matched.should.equal(true);

    if (!result.matched) {
      throw new Error("Expected parse result to match.");
    }

    result.match.syntaxId.should.equal("sample-equipment");
    result.match.normalizedText.should.equal("39-HA-901");
    result.match.groups.system.should.equal("39");
    result.match.groups.classCode.should.equal("HA");
    result.match.groups.number.should.equal("901");
  });

  it("should return unmatched result for non-matching text", () => {
    const syntax = fixture.createSampleSyntax();

    const result = syntax.parse("not-a-tag");

    result.matched.should.equal(false);
  });

  it("should reject empty input text", () => {
    const syntax = fixture.createSampleSyntax();

    (() => syntax.parse(" ")).should.throw(TagSyntaxErrorMessages.textMustNotBeEmpty);
  });

  it("should reject empty syntax id", () => {
    class EmptySyntaxIdSyntax extends RegexTagSyntaxBase {
      public constructor() {
        super({
          syntaxId: " ",
          pattern: /^.+$/u,
        });
      }
    }

    (() => new EmptySyntaxIdSyntax()).should.throw(
      TagSyntaxErrorMessages.syntaxIdMustNotBeEmpty,
    );
  });

  it("should reject regex with global flag", () => {
    class GlobalPatternSyntax extends RegexTagSyntaxBase {
      public constructor() {
        super({
          syntaxId: "bad-global",
          pattern: /^.+$/gu,
        });
      }
    }

    (() => new GlobalPatternSyntax()).should.throw(
      TagSyntaxErrorMessages.patternMustNotUseGlobalFlag,
    );
  });
});