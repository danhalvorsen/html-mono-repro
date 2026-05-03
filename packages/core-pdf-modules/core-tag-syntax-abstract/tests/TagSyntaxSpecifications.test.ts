import "chai/register-should";
import { describe, it } from "vitest";
import {
  TagSyntaxGroupEqualsSpecification,
  TagSyntaxGroupMatchesSpecification,
  TagSyntaxMatchesTextSpecification,
  TagSyntaxRegistry,
  TagSyntaxRegistryMatchesTextSpecification,
  TagSyntaxResultMatchedSpecification,
  TagSyntaxResultSyntaxIdSpecification,
} from "../src/index.js";
import { TagSyntaxAbstractFixture } from "./fixtures/TagSyntaxAbstractFixture.js";

describe("Tag syntax specifications", () => {
  const fixture = new TagSyntaxAbstractFixture();

  it("should match text by syntax", () => {
    const specification = new TagSyntaxMatchesTextSpecification(
      fixture.createSampleSyntax(),
    );

    specification.isSatisfiedBy("39-HA-901").should.equal(true);
  });

  it("should reject text when syntax does not match", () => {
    const specification = new TagSyntaxMatchesTextSpecification(
      fixture.createSampleSyntax(),
    );

    specification.isSatisfiedBy("not-a-tag").should.equal(false);
  });

  it("should match text by registry", () => {
    const registry = new TagSyntaxRegistry([
      fixture.createSampleSyntax(),
    ]);

    const specification = new TagSyntaxRegistryMatchesTextSpecification(registry);

    specification.isSatisfiedBy("39-HA-901").should.equal(true);
  });

  it("should match a parsed group by exact value", () => {
    const specification = new TagSyntaxGroupEqualsSpecification(
      fixture.createSampleSyntax(),
      "system",
      "39",
    );

    specification.isSatisfiedBy("39-HA-901").should.equal(true);
  });

  it("should match a parsed group by pattern", () => {
    const specification = new TagSyntaxGroupMatchesSpecification(
      fixture.createSampleSyntax(),
      "classCode",
      /^[A-Z]{2}$/u,
    );

    specification.isSatisfiedBy("39-HA-901").should.equal(true);
  });

  it("should reject invalid group pattern with global flag", () => {
    const syntax = fixture.createSampleSyntax();

    const createSpecification = (): TagSyntaxGroupMatchesSpecification =>
      new TagSyntaxGroupMatchesSpecification(
        syntax,
        "classCode",
        /^[A-Z]{2}$/gu,
      );

    createSpecification.should.throw("pattern must not use the global flag.");
  });

  it("should support chained logical expressions for text queries", () => {
    const syntax = fixture.createSampleSyntax();

    const specification = new TagSyntaxMatchesTextSpecification(syntax)
      .and(new TagSyntaxGroupEqualsSpecification(syntax, "system", "39"))
      .and(new TagSyntaxGroupMatchesSpecification(syntax, "number", /^\d+$/u));

    specification.isSatisfiedBy("39-HA-901").should.equal(true);
  });

  it("should support negated expressions for text queries", () => {
    const syntax = fixture.createSampleSyntax();

    const specification = new TagSyntaxMatchesTextSpecification(syntax).not();

    specification.isSatisfiedBy("not-a-tag").should.equal(true);
  });

  it("should match parse result by matched state", () => {
    const result = fixture.createSampleSyntax().parse("39-HA-901");
    const specification = new TagSyntaxResultMatchedSpecification();

    specification.isSatisfiedBy(result).should.equal(true);
  });

  it("should match parse result by syntax id", () => {
    const result = fixture.createSampleSyntax().parse("39-HA-901");
    const specification = new TagSyntaxResultSyntaxIdSpecification("sample-equipment");

    specification.isSatisfiedBy(result).should.equal(true);
  });
});