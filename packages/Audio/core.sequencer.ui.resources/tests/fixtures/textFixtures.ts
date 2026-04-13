import { SemanticShapesComposition } from "@monorepo/core-semantic-model-shapes";
import type { Digit } from "../../src/digitButton.js";
import type { KnobVariant } from "../../src/knobButton.js";
import type { ToneLabel } from "../../src/toneLabel.js";

const rectangleFactory = new SemanticShapesComposition().rectangleFactory;

export const FIXTURE_TEXT = Object.freeze({
  buttonLabel: "Play",
  empty: "",
  buttonId: "btn-1",
  digitId: "digit-3",
  digitPrefix: "digit",
  rgbId: "rgb-1",
  knobId: "knob-1",
  toneId: "tone-1",
});

export const FIXTURE_NUMBERS = Object.freeze({
  x: 0,
  y: 0,
  width: 88,
  height: 88,
  smallWidth: 12,
  smallHeight: 12,
});

export function createBaseButtonInput() {
  return {
    shape: rectangleFactory.create({
      id: FIXTURE_TEXT.buttonId,
      x: FIXTURE_NUMBERS.x,
      y: FIXTURE_NUMBERS.y,
      width: FIXTURE_NUMBERS.width,
      height: FIXTURE_NUMBERS.height,
    }),
    id: FIXTURE_TEXT.buttonId,
    x: FIXTURE_NUMBERS.x,
    y: FIXTURE_NUMBERS.y,
    width: FIXTURE_NUMBERS.width,
    height: FIXTURE_NUMBERS.height,
    label: FIXTURE_TEXT.buttonLabel,
  } as const;
}

export function createDigitInput(digit: Digit, on = true) {
  return {
    shape: rectangleFactory.create({
      id: `${FIXTURE_TEXT.digitId}-${digit}`,
      x: FIXTURE_NUMBERS.x,
      y: FIXTURE_NUMBERS.y,
      width: FIXTURE_NUMBERS.width,
      height: FIXTURE_NUMBERS.height,
    }),
    id: `${FIXTURE_TEXT.digitId}-${digit}`,
    x: FIXTURE_NUMBERS.x,
    y: FIXTURE_NUMBERS.y,
    width: FIXTURE_NUMBERS.width,
    height: FIXTURE_NUMBERS.height,
    digit,
    on,
  } as const;
}

export function createRgbInput() {
  return {
    id: FIXTURE_TEXT.rgbId,
    x: FIXTURE_NUMBERS.x,
    y: FIXTURE_NUMBERS.y,
    width: FIXTURE_NUMBERS.smallWidth,
    height: FIXTURE_NUMBERS.smallHeight,
    r: 300,
    g: -20,
    b: 42,
    on: false,
  } as const;
}

export function createKnobInput(variant: KnobVariant, on = true) {
  return {
    id: `${FIXTURE_TEXT.knobId}-${variant}`,
    x: FIXTURE_NUMBERS.x,
    y: FIXTURE_NUMBERS.y,
    width: FIXTURE_NUMBERS.width,
    height: FIXTURE_NUMBERS.height,
    variant,
    on,
    angle: 90,
  } as const;
}

export function createToneInput(tone: ToneLabel) {
  return {
    id: `${FIXTURE_TEXT.toneId}-${tone}`,
    x: FIXTURE_NUMBERS.x,
    y: FIXTURE_NUMBERS.y,
    buttonWidth: FIXTURE_NUMBERS.width,
    buttonHeight: FIXTURE_NUMBERS.height,
    tone,
  } as const;
}
