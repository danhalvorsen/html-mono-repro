// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { TangentSkin } from "../tangent-skin";

describe("TangentSkin margin and font sizing rule", () => {
  it("uses a 10% safe margin on all tangent edges by default", async () => {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.tangentId = "C1";
    skin.keyType = "white";

    document.body.appendChild(skin);
    await skin.updateComplete;

    const safeArea = skin.shadowRoot?.querySelector(".safe-area");

    expect(safeArea).toBeInstanceOf(HTMLElement);

    const safeAreaElement = safeArea as HTMLElement;

    expect(skin.getResolvedMarginRatio()).toBe(0.1);
    expect(skin.getAvailableWidthRatio()).toBe(0.8);

    expect(safeAreaElement.style.left).toBe("10%");
    expect(safeAreaElement.style.top).toBe("10%");
    expect(safeAreaElement.style.right).toBe("10%");
    expect(safeAreaElement.style.bottom).toBe("10%");

    expect(safeAreaElement.dataset.marginRatio).toBe("0.100000");
    expect(safeAreaElement.dataset.availableWidthRatio).toBe("0.800000");

    skin.remove();
  });

  it("limits font size by character count so total text width stays inside the safe area", async () => {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.tangentId = "Fs4";
    skin.keyType = "black";
    skin.skinMarginRatio = 0.1;
    skin.maxTextWidthRatio = 0.8;

    document.body.appendChild(skin);
    await skin.updateComplete;

    const safeArea = skin.shadowRoot?.querySelector(".safe-area");
    const label = skin.shadowRoot?.querySelector(".label");

    expect(safeArea).toBeInstanceOf(HTMLElement);
    expect(label).toBeInstanceOf(HTMLElement);

    const safeAreaElement = safeArea as HTMLElement;
    const labelElement = label as HTMLElement;

    expect(skin.getCharacterCount()).toBe(3);
    expect(skin.getMaxTextWidthRatio()).toBe(0.8);
    expect(skin.getFontSizeRatioOfAvailableWidth()).toBeCloseTo(0.8 / 3, 12);
    expect(skin.getEstimatedTextWidthRatioOfAvailableWidth()).toBeCloseTo(0.8, 12);

    expect(Number(safeAreaElement.dataset.characterCount)).toBe(3);
    expect(Number(safeAreaElement.dataset.fontSizeAvailableRatio)).toBeCloseTo(0.8 / 3, 6);
    expect(Number(safeAreaElement.dataset.estimatedTextWidthAvailableRatio)).toBeCloseTo(0.8, 6);

    expect(labelElement.dataset.fontSizeCqw).toBe(`${(0.8 / 3) * 100}cqw`);
    expect(
      labelElement.style.getPropertyValue("--tangent-skin-font-size-cqw")
    ).toBe(`${(0.8 / 3) * 100}cqw`);

    skin.remove();
  });

  it("keeps font size at or below 80% of available width for one-character labels", async () => {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.tangentId = "C";
    skin.keyType = "white";
    skin.skinMarginRatio = 0.1;
    skin.maxTextWidthRatio = 0.8;

    document.body.appendChild(skin);
    await skin.updateComplete;

    expect(skin.getCharacterCount()).toBe(1);
    expect(skin.getFontSizeRatioOfAvailableWidth()).toBe(0.8);
    expect(skin.getEstimatedTextWidthRatioOfAvailableWidth()).toBe(0.8);

    skin.remove();
  });

  it("clamps unsafe margin values", async () => {
    const skin = document.createElement("tangent-skin") as TangentSkin;

    skin.visible = true;
    skin.template = "identifier";
    skin.tangentId = "C3";
    skin.skinMarginRatio = 0.8;

    document.body.appendChild(skin);
    await skin.updateComplete;

    const safeArea = skin.shadowRoot?.querySelector(".safe-area");

    expect(safeArea).toBeInstanceOf(HTMLElement);
    expect(skin.getResolvedMarginRatio()).toBe(0.45);
    expect((safeArea as HTMLElement).style.left).toBe("45%");
    expect((safeArea as HTMLElement).style.right).toBe("45%");

    skin.remove();
  });
});