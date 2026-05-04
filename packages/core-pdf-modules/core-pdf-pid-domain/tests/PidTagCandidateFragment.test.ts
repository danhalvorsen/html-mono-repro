import { describe, expect, it } from "vitest";
import { PidTagCandidateFragment } from "../src/index.js";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PidTagCandidateFragment", () => {
  const fixture = new PidDomainFixture();

  it("should create a normalized tag candidate when input is valid", () => {
    const candidate = fixture.createTagCandidate("  p-101  ");

    expect(candidate.pidKind).toBe(fixture.kinds.TagCandidate);
    expect(candidate.text).toBe("  p-101  ");
    expect(candidate.normalizedText).toBe("P-101");
    expect(candidate.confidence).toBe(0.95);
    expect(candidate.pageNumber).toBe(1);
    expect(candidate.sourceFragments.length).toBe(1);
  });

  it("should reject empty text", () => {
    expect(() => fixture.createTagCandidate(" ")).toThrow("text must not be empty.");
  });

  it("should reject invalid confidence", () => {
    expect(() => fixture.createTagCandidate("P-101", 1.1)).toThrow(
      "confidence must be a finite number between 0 and 1.",
    );
  });

  it("should reject invalid page number", () => {
    const source = fixture.createTextFragment("P-101");

    expect(() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: 0,
        boundingBox: source.boundingBox,
        sourceFragments: [source],
      }),
    ).toThrow("pageNumber must be an integer >= 1.");
  });

  it("should reject empty source fragments", () => {
    const source = fixture.createTextFragment("P-101");

    expect(() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: source.pageNumber,
        boundingBox: source.boundingBox,
        sourceFragments: [],
      }),
    ).toThrow("sourceFragments must contain at least one fragment.");
  });

  it("should reject invalid bounding box", () => {
    const source = fixture.createTextFragment("P-101");

    expect(() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: source.pageNumber,
        boundingBox: fixture.createBoundingBox({ width: 0 }),
        sourceFragments: [source],
      }),
    ).toThrow("boundingBox.width must be greater than zero.");
  });
});
