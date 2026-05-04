import "chai/register-should";
import { describe, it } from "vitest";
import { TagSyntaxRegistry } from "../src/index.js";
import { TagSyntaxAbstractFixture } from "./fixtures/TagSyntaxAbstractFixture.js";

describe("TagSyntaxRegistry", () => {
  const fixture = new TagSyntaxAbstractFixture();

  it("should return first matching syntax result", () => {
    const registry = new TagSyntaxRegistry([
      fixture.createSampleSyntax(),
    ]);

    const result = registry.findFirst("39-HA-901");

    (result !== null).should.equal(true);
    result?.matched.should.equal(true);
  });

  it("should return null when no syntax matches", () => {
    const registry = new TagSyntaxRegistry([
      fixture.createSampleSyntax(),
    ]);

    const result = registry.findFirst("not-a-tag");

    (result === null).should.equal(true);
  });

  it("should reject empty syntax list", () => {
    (() => new TagSyntaxRegistry([])).should.throw(
      "syntaxes must contain at least one syntax.",
    );
  });
});