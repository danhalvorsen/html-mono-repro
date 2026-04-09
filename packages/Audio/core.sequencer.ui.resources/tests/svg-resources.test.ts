import { describe, expect, it } from "vitest";

import { createButtonSvg } from "../src/svgButton.js";
import { createDigitButtonSvg, createDigitButtonsSvg } from "../src/digitButton.js";
import { createRgbButtonSvg } from "../src/rgbButton.js";
import { createKnobButtonSvg } from "../src/knobButton.js";
import {
  TONE_SCALE,
  createToneLabelSvg,
  createToneScaleLabelsSvg,
} from "../src/toneLabel.js";
import {
  FIXTURE_TEXT,
  createBaseButtonInput,
  createDigitInput,
  createKnobInput,
  createRgbInput,
  createToneInput,
} from "./fixtures/textFixtures.js";

describe("svg resources", () => {
  describe("createButtonSvg", () => {
    it("should create deterministic SVG and semantic rectangle shape", () => {
      const input = createBaseButtonInput();

      const first = createButtonSvg(input);
      const second = createButtonSvg(input);

      expect(first.shape.id).toBe(input.id);
      expect(first.svg).toContain("<rect");
      expect(first.svg).toContain(">Play<");
      expect(first.svg).toBe(second.svg);
    });

    it("should throw when label is empty", () => {
      expect(() =>
        createButtonSvg({
          ...createBaseButtonInput(),
          label: FIXTURE_TEXT.empty,
        })
      ).toThrow(/label/i);
    });
  });

  describe("createDigitButtonSvg", () => {
    it("should create an on-state digit button with accent bar", () => {
      const resource = createDigitButtonSvg(createDigitInput(3, true));

      expect(resource.on).toBe(true);
      expect(resource.digit).toBe(3);
      expect(resource.svg).toContain("Digit 3");
      expect(resource.svg).toContain("<text");
      expect(resource.svg).toContain(">3<");
    });

    it("should create an off-state digit button with dim style", () => {
      const resource = createDigitButtonSvg(createDigitInput(3, false));

      expect(resource.on).toBe(false);
      expect(resource.svg).toContain("Digit 3");
      expect(resource.svg).toContain("<rect");
    });
  });

  describe("createDigitButtonsSvg", () => {
    it("should return ten buttons and set one active digit", () => {
      const resources = createDigitButtonsSvg({
        idPrefix: FIXTURE_TEXT.digitPrefix,
        startX: 0,
        startY: 0,
        buttonWidth: 48,
        buttonHeight: 48,
        onDigit: 7,
      });

      expect(resources).toHaveLength(10);
      expect(resources.filter((item) => item.on)).toHaveLength(1);
      expect(resources.some((item) => item.digit === 7 && item.on)).toBe(true);
    });
  });

  describe("createRgbButtonSvg", () => {
    it("should clamp rgb channels and keep deterministic output", () => {
      const input = createRgbInput();
      const first = createRgbButtonSvg(input);
      const second = createRgbButtonSvg(input);

      expect(first.on).toBe(false);
      expect(first.svg).toContain("rgb(255, 0, 42)");
      expect(first.svg).toContain('fill-opacity="0.35"');
      expect(first.svg).toBe(second.svg);
    });
  });

  describe("createKnobButtonSvg", () => {
    it("should create all knob variants", () => {
      const variants = ["matte", "glossy", "ribbed", "beveled"] as const;

      for (const variant of variants) {
        const resource = createKnobButtonSvg(createKnobInput(variant, true));
        expect(resource.variant).toBe(variant);
        expect(resource.on).toBe(true);
        expect(resource.svg).toContain(`Knob button ${variant} on`);
      }
    });

    it("should throw when id is empty", () => {
      expect(() =>
        createKnobButtonSvg({
          ...createKnobInput("matte"),
          id: "",
        })
      ).toThrow(/id/i);
    });
  });

  describe("createToneLabelSvg", () => {
    it("should create label width equal to button width and height at twenty percent", () => {
      const input = createToneInput("C#");
      const resource = createToneLabelSvg(input);

      expect(resource.labelWidth).toBe(input.buttonWidth);
      expect(resource.labelHeight).toBe(input.buttonHeight * 0.2);
      expect(resource.svg).toContain(">C#<");
      expect(resource.svg).toContain("Tone C#");
    });
  });

  describe("createToneScaleLabelsSvg", () => {
    it("should create one distinct label for each tone in the scale", () => {
      const resources = createToneScaleLabelsSvg({
        idPrefix: "tone",
        startX: 0,
        startY: 0,
        buttonWidth: 88,
        buttonHeight: 88,
      });

      expect(resources).toHaveLength(TONE_SCALE.length);
      expect(new Set(resources.map((item) => item.tone)).size).toBe(TONE_SCALE.length);
      expect(resources[0]?.labelHeight).toBe(17.6);
    });

    it("should throw when idPrefix is empty", () => {
      expect(() =>
        createToneScaleLabelsSvg({
          idPrefix: FIXTURE_TEXT.empty,
          startX: 0,
          startY: 0,
          buttonWidth: 88,
          buttonHeight: 88,
        })
      ).toThrow(/id/i);
    });
  });
});
