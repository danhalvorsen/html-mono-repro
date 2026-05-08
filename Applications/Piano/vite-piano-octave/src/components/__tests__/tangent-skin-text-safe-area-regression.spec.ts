// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { TangentSkin } from "../tangent-skin";

class TangentSkinRegressionFixture {
  public async createSkin(tangentId: string): Promise<TangentSkin> {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.keyType = "black";
    skin.tangentId = tangentId;
    skin.skinMarginRatio = 0.1;
    skin.maxTextWidthRatio = 0.8;

    document.body.appendChild(skin);
    await skin.updateComplete;

    return skin;
  }
}

describe("TangentSkin text safe-area regression", () => {
  it("fixes the black-key overflow: Fs4 text width is constrained inside the 10% margin safe area", async () => {
    const fixture = new TangentSkinRegressionFixture();
    const skin = await fixture.createSkin("Fs4");

    const expectedCharacterCount = 3;
    const expectedFontSizeRatio = 0.8 / expectedCharacterCount;

    expect(skin.getResolvedMarginRatio()).toBe(0.1);
    expect(skin.getAvailableWidthRatio()).toBe(0.8);

    expect(skin.getCharacterCount()).toBe(expectedCharacterCount);
    expect(skin.getFontSizeRatioOfAvailableWidth()).toBeCloseTo(expectedFontSizeRatio, 12);
    expect(skin.getEstimatedTextWidthRatioOfAvailableWidth()).toBeCloseTo(0.8, 12);

    expect(skin.getEstimatedTextWidthRatioOfAvailableWidth()).toBeLessThanOrEqual(0.8);

    skin.remove();
  });

  it("fixes every three-character sharp label with octave suffix", async () => {
    const fixture = new TangentSkinRegressionFixture();
    const labels = ["Cs4", "Ds4", "Fs4", "Gs4", "As4"];

    for (const label of labels) {
      const skin = await fixture.createSkin(label);
      const expectedFontSizeRatio = 0.8 / label.length;

      expect(
        skin.getEstimatedTextWidthRatioOfAvailableWidth(),
        `${label} must fit inside the safe area`
      ).toBeLessThanOrEqual(0.8);

      expect(
        skin.getFontSizeRatioOfAvailableWidth(),
        `${label} font size must be divided by character count`
      ).toBeCloseTo(expectedFontSizeRatio, 12);

      skin.remove();
    }
  });

  it("does not use the old broken rule where every label got 80% font size regardless of character count", async () => {
    const fixture = new TangentSkinRegressionFixture();
    const skin = await fixture.createSkin("As4");

    const expectedFontSizeRatio = 0.8 / 3;

    expect(skin.getFontSizeRatioOfAvailableWidth()).not.toBe(0.8);
    expect(skin.getFontSizeRatioOfAvailableWidth()).toBeCloseTo(expectedFontSizeRatio, 12);

    skin.remove();
  });
});