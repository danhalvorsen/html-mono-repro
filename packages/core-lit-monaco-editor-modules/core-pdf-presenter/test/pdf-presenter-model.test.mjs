import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_PDF_PRESENTATION_HEIGHT,
  DEFAULT_PDF_PRESENTATION_WIDTH,
  hasPdfSource,
  normalizePdfPresenterDimension,
} from "../dist/pdf-presenter-model.js";

test("normalizePdfPresenterDimension should return fallback for non-finite values", () => {
  assert.equal(normalizePdfPresenterDimension(Number.NaN, 700), 700);
  assert.equal(normalizePdfPresenterDimension(Number.POSITIVE_INFINITY, 700), 700);
});

test("normalizePdfPresenterDimension should return fallback for non-positive values", () => {
  assert.equal(normalizePdfPresenterDimension(0, 900), 900);
  assert.equal(normalizePdfPresenterDimension(-10, 900), 900);
});

test("normalizePdfPresenterDimension should normalize valid numbers", () => {
  assert.equal(normalizePdfPresenterDimension(1000.9, 700), 1000);
});

test("hasPdfSource should reject empty or whitespace-only values", () => {
  assert.equal(hasPdfSource(""), false);
  assert.equal(hasPdfSource("   \n  \t"), false);
});

test("hasPdfSource should accept non-empty values", () => {
  assert.equal(hasPdfSource("/samples/demo.pdf"), true);
});

test("default presentation dimensions should be stable", () => {
  assert.equal(DEFAULT_PDF_PRESENTATION_WIDTH, 900);
  assert.equal(DEFAULT_PDF_PRESENTATION_HEIGHT, 700);
});
