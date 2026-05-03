import "chai/register-should";
import { describe, it } from "vitest";
import { PidTagCandidateFragment } from "../src/index.js";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PidTagCandidateFragment", () => {
  const fixture = new PidDomainFixture();

  it("should create a normalized tag candidate when input is valid", () => {
    const candidate = fixture.createTagCandidate("  p-101  ");

    candidate.pidKind.should.equal(fixture.kinds.TagCandidate);
    candidate.text.should.equal("  p-101  ");
    candidate.normalizedText.should.equal("P-101");
    candidate.confidence.should.equal(0.95);
    candidate.pageNumber.should.equal(1);
    candidate.sourceFragments.length.should.equal(1);
  });

  it("should reject empty text", () => {
    (() => fixture.createTagCandidate(" ")).should.throw("text must not be empty.");
  });

  it("should reject invalid confidence", () => {
    (() => fixture.createTagCandidate("P-101", 1.1)).should.throw(
      "confidence must be a finite number between 0 and 1.",
    );
  });

  it("should reject invalid page number", () => {
    const source = fixture.createTextFragment("P-101");

    (() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: 0,
        boundingBox: source.boundingBox,
        sourceFragments: [source],
      }),
    ).should.throw("pageNumber must be an integer >= 1.");
  });

  it("should reject empty source fragments", () => {
    const source = fixture.createTextFragment("P-101");

    (() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: source.pageNumber,
        boundingBox: source.boundingBox,
        sourceFragments: [],
      }),
    ).should.throw("sourceFragments must contain at least one fragment.");
  });

  it("should reject invalid bounding box", () => {
    const source = fixture.createTextFragment("P-101");

    (() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: source.pageNumber,
        boundingBox: fixture.createBoundingBox({ width: 0 }),
        sourceFragments: [source],
      }),
    ).should.throw("boundingBox.width must be greater than zero.");
  });
});