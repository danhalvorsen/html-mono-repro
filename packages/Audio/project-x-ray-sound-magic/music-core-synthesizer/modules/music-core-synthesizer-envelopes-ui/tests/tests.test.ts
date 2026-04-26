// packages/Audio/music-core-synthesizer/modules/music-core-synthesizer-envelopes/tests/tests.test.ts

import { describe, expect, it } from "vitest";

import {
  ADSR_ENVELOPE,
  AdsrEnvelope,
  type IAdsrEnvelopeDefinition,
} from "../src/index.js";

function createFixture(): IAdsrEnvelopeDefinition {
  return AdsrEnvelope.create({
    attackSeconds: 0.01,
    decaySeconds: 0.1,
    sustainLevel: 0.7,
    releaseSeconds: 0.25,
  });
}

describe("AdsrEnvelope", () => {
  it("should create a valid ADSR envelope", () => {
    const envelope = createFixture();

    expect(envelope).toEqual({
      type: ADSR_ENVELOPE,
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    });
  });

  it("should freeze the created envelope", () => {
    const envelope = createFixture();

    expect(Object.isFrozen(envelope)).toBe(true);
  });

  it("should allow zero timing values", () => {
    const envelope = AdsrEnvelope.create({
      attackSeconds: 0,
      decaySeconds: 0,
      sustainLevel: 0,
      releaseSeconds: 0,
    });

    expect(envelope.attackSeconds).toBe(0);
    expect(envelope.decaySeconds).toBe(0);
    expect(envelope.sustainLevel).toBe(0);
    expect(envelope.releaseSeconds).toBe(0);
  });

  it.each([
    ["attackSeconds", -0.01],
    ["decaySeconds", -0.01],
    ["releaseSeconds", -0.01],
  ] as const)("should reject negative %s", (field, value) => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: field === "attackSeconds" ? value : 0.01,
        decaySeconds: field === "decaySeconds" ? value : 0.1,
        sustainLevel: 0.7,
        releaseSeconds: field === "releaseSeconds" ? value : 0.25,
      }),
    ).toThrow(`${field} must be >= 0.`);
  });

  it.each([
    ["attackSeconds", Number.NaN],
    ["decaySeconds", Number.NaN],
    ["releaseSeconds", Number.NaN],
    ["attackSeconds", Number.POSITIVE_INFINITY],
    ["decaySeconds", Number.POSITIVE_INFINITY],
    ["releaseSeconds", Number.POSITIVE_INFINITY],
  ] as const)("should reject non-finite %s", (field, value) => {
    expect(() =>
      AdsrEnvelope.create({
        attackSeconds: field === "attackSeconds" ? value : 0.01,
        decaySeconds: field === "decaySeconds" ? value : 0.1,
        sustainLevel: 0.7,
        releaseSeconds: field === "releaseSeconds" ? value : 0.25,
      }),
    ).toThrow(`${field} must be >= 0.`);
  });

  it.each([-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY])(
    "should reject invalid sustainLevel %s",
    (sustainLevel) => {
      expect(() =>
        AdsrEnvelope.create({
          attackSeconds: 0.01,
          decaySeconds: 0.1,
          sustainLevel,
          releaseSeconds: 0.25,
        }),
      ).toThrow("sustainLevel must be in range 0..1.");
    },
  );
});