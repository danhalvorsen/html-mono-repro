// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { TangentSkin } from "../tangent-skin";

describe("TangentSkin safe text contract", () => {
  it("keeps a 10% safe margin on every edge", async () => {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.tangentId = "C2";
    skin.skinMarginRatio = 0.1;

    document.body.appendChild(skin);
    await skin.updateComplete;

    const safeArea = skin.shadowRoot?.querySelector(".safe-area") as HTMLElement | null;

    expect(safeArea).toBeInstanceOf(HTMLElement);
    expect(safeArea?.style.left).toBe("10%");
    expect(safeArea?.style.top).toBe("10%");
    expect(safeArea?.style.right).toBe("10%");
    expect(safeArea?.style.bottom).toBe("10%");

    expect(skin.getResolvedMarginRatio()).toBe(0.1);
    expect(skin.getAvailableWidthRatio()).toBe(0.8);

    skin.remove();
  });

  it("limits rendered text width, not only font size, for three-character black-key labels", async () => {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.keyType = "black";
    skin.tangentId = "Fs4";
    skin.skinMarginRatio = 0.1;
    skin.maxTextWidthRatio = 0.8;

    document.body.appendChild(skin);
    await skin.updateComplete;

    const expectedFontRatio = 0.8 / 3;

    expect(skin.getCharacterCount()).toBe(3);
    expect(skin.getFontSizeRatioOfAvailableWidth()).toBeCloseTo(expectedFontRatio, 12);
    expect(skin.getEstimatedTextWidthRatioOfAvailableWidth()).toBeCloseTo(0.8, 12);
    expect(skin.getEstimatedTextWidthRatioOfAvailableWidth()).toBeLessThanOrEqual(0.8);

    const label = skin.shadowRoot?.querySelector(".label") as HTMLElement | null;

    expect(label).toBeInstanceOf(HTMLElement);
    expect(label?.dataset.fontSizeCqw).toBe(`${expectedFontRatio * 100}cqw`);
    expect(label?.style.getPropertyValue("--tangent-skin-font-size-cqw")).toBe(
      `${expectedFontRatio * 100}cqw`
    );

    skin.remove();
  });

  it("applies the same text-width rule to every sharp label with octave suffix", async () => {
    const labels = ["Cs4", "Ds4", "Fs4", "Gs4", "As4"];

    for (const labelText of labels) {
      const skin = document.createElement("tangent-skin") as TangentSkin;

      skin.visible = true;
      skin.template = "identifier";
      skin.keyType = "black";
      skin.tangentId = labelText;
      skin.skinMarginRatio = 0.1;
      skin.maxTextWidthRatio = 0.8;

      document.body.appendChild(skin);
      await skin.updateComplete;

      expect(
        skin.getEstimatedTextWidthRatioOfAvailableWidth(),
        `${labelText} must fit inside the safe area`
      ).toBeLessThanOrEqual(0.8);

      expect(
        skin.getFontSizeRatioOfAvailableWidth(),
        `${labelText} font ratio must use character count`
      ).toBeCloseTo(0.8 / labelText.length, 12);

      skin.remove();
    }
  });
});