/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from "vitest";

import {
  DigitButtonEvents,
  DigitButtonRowEvents,
  KnobButtonEvents,
  type IKnobButtonCircularDraggingDetail,
  RgbButtonEvents,
  ShiftButtonEvents,
  TransportButtonEvents,
} from "../src/events.js";
import "../src/digit-button-element.js";
import "../src/digit-button-row-element.js";
import "../src/rgb-button-element.js";
import "../src/svg-rgb-label-button-element.js";
import "../src/knob-button-element.js";
import "../src/tone-label-element.js";
import "../src/tone-label-row-element.js";
import "../src/transport-button-element.js";
import "../src/transport-row-element.js";
import "../src/shift-button-element.js";
import "../src/web-card-element.js";
import "../src/volume-web-card-element.js";
import { createSvgRgbLabelButtonLayout } from "../src/svg-rgb-label-button-layout.js";

type LitLikeElement = HTMLElement & {
  updateComplete?: Promise<unknown>;
};

function createElement<T extends LitLikeElement>(
  tagName: string,
  props: Record<string, unknown> = {},
): T {
  const element = document.createElement(tagName) as T;
  Object.assign(element, props);
  document.body.append(element);
  return element;
}

async function renderElement<T extends LitLikeElement>(
  tagName: string,
  props: Record<string, unknown> = {},
): Promise<T> {
  const element = createElement<T>(tagName, props);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("web components", () => {
  it("renders sequencer-digit-button with selected state and clamped aria label", async () => {
    const element = await renderElement<LitLikeElement>("sequencer-digit-button", {
      digit: 12,
      selected: true,
      labelPrefix: "Step",
    });
    const button = element.shadowRoot?.querySelector("button");

    expect(button?.getAttribute("aria-pressed")).toBe("true");
    expect(button?.getAttribute("aria-label")).toBe("Step 9");
    expect(element.shadowRoot?.innerHTML).toContain("<svg");
  });

  it("dispatches digit selection changes from sequencer-digit-button-row", async () => {
    const element = await renderElement<LitLikeElement>("sequencer-digit-button-row", {
      selectedDigit: -1,
    });

    const eventPromise = new Promise<number | undefined>((resolve) => {
      element.addEventListener(DigitButtonRowEvents.selectionChanged, (event) => {
        resolve((event as CustomEvent<{ selectedDigit: number }>).detail?.selectedDigit);
      }, { once: true });
    });

    const firstDigit = element.shadowRoot?.querySelector("sequencer-digit-button") as LitLikeElement | null;
    await firstDigit?.updateComplete;
    (firstDigit?.shadowRoot?.querySelector("button") as HTMLButtonElement).click();
    await element.updateComplete;

    expect(await eventPromise).toBe(0);
    expect((element as { selectedDigit: number }).selectedDigit).toBe(0);
    expect(element.shadowRoot?.querySelectorAll("sequencer-digit-button")).toHaveLength(10);
  });

  it("dispatches RGB toggle intent from sequencer-rgb-button", async () => {
    const element = await renderElement<LitLikeElement>("sequencer-rgb-button", {
      r: 12,
      g: 34,
      b: 56,
      on: false,
    });

    const eventPromise = new Promise<{ r: number; g: number; b: number; on: boolean } | undefined>((resolve) => {
      element.addEventListener(RgbButtonEvents.toggleRequested, (event) => {
        resolve((event as CustomEvent<{ r: number; g: number; b: number; on: boolean }>).detail);
      }, { once: true });
    });

    (element.shadowRoot?.querySelector("button") as HTMLButtonElement).click();

    expect(await eventPromise).toEqual({ r: 12, g: 34, b: 56, on: true });
  });

  it("renders svg-rgb-label-button as a semantic composite of RGB button and label", async () => {
    const element = await renderElement<LitLikeElement>("svg-rgb-label-button", {
      r: 12,
      g: 34,
      b: 56,
      label: "D#",
      width: 88,
      height: 88,
      labelPlacement: "bottom",
      labelAlignment: "center",
      labelAttachment: "inside",
      labelGap: 0,
      labelSpan: 1,
    });

    const rgbButton = element.shadowRoot?.querySelector("sequencer-rgb-button") as LitLikeElement | null;
    const svgLabel = element.shadowRoot?.querySelector("svg-label") as LitLikeElement | null;

    await rgbButton?.updateComplete;
    await svgLabel?.updateComplete;

    expect(rgbButton).not.toBeNull();
    expect(svgLabel).not.toBeNull();
    expect(rgbButton?.shadowRoot?.querySelector("svg")).not.toBeNull();
    expect(svgLabel?.shadowRoot?.querySelector("svg")).not.toBeNull();
  });

  it("creates semantic layout for svg-rgb-label-button with label position controlled by the model", () => {
    const layout = createSvgRgbLabelButtonLayout({
      width: 88,
      height: 88,
      labelMargin: 10,
      labelPlacement: "top",
      labelAlignment: "center",
      labelAttachment: "outside",
      labelGap: 8,
      labelSpan: 0.5,
    });

    expect(layout.buttonFrame.x).toBe(0);
    expect(layout.buttonFrame.y).toBe(0);
    expect(layout.labelFrame.x).toBeCloseTo(22, 5);
    expect(layout.labelFrame.y).toBe(-26);
    expect(layout.labelFrame.width).toBe(44);
    expect(layout.labelFrame.height).toBe(18);
    expect(layout.boundsFrame.width).toBe(88);
    expect(layout.boundsFrame.height).toBe(114);
    expect(layout.label.properties).toContainEqual({ key: "labelPlacement", value: "top" });
    expect(layout.label.properties).toContainEqual({ key: "labelAlignment", value: "center" });
    expect(layout.label.properties).toContainEqual({ key: "labelAttachment", value: "outside" });
    expect(layout.label.properties).toContainEqual({ key: "labelMargin", value: 10 });
  });

  it("dispatches knob toggle intent from sequencer-knob-button", async () => {
    const element = await renderElement<LitLikeElement>("sequencer-knob-button", {
      variant: "ribbed",
      on: true,
    });

    const eventPromise = new Promise<{ variant: string; on: boolean } | undefined>((resolve) => {
      element.addEventListener(KnobButtonEvents.toggleRequested, (event) => {
        resolve((event as CustomEvent<{ variant: string; on: boolean }>).detail);
      }, { once: true });
    });

    (element.shadowRoot?.querySelector("button") as HTMLButtonElement).click();

    expect(await eventPromise).toEqual({ variant: "ribbed", on: false });
    expect(element.shadowRoot?.innerHTML).toContain("aria-pressed=\"true\"");
  });

  it("renders svg-label with normalized tone fallback", async () => {
    const element = await renderElement<LitLikeElement>("svg-label", {
      label: "",
      tone: "H",
      state: "inactive",
      buttonWidth: 88,
      buttonHeight: 88,
      fillColor: "#ff0000",
      fillOpacity: 0.5,
      textColor: "#00ff00",
      margin: 10,
    });

    expect(element.shadowRoot?.innerHTML).toContain("Label C");
    expect(element.shadowRoot?.innerHTML).toContain("#ff0000");
    expect(element.shadowRoot?.innerHTML).toContain("fill-opacity=\"0.5\"");
    expect(element.shadowRoot?.innerHTML).toContain("#00ff00");
    expect(element.shadowRoot?.innerHTML).toContain("x=\"8.8\"");
    expect(element.shadowRoot?.querySelector("svg")).not.toBeNull();
  });

  it("renders svg-label inactive state with dimmed defaults when overrides are absent", async () => {
    const element = await renderElement<LitLikeElement>("svg-label", {
      label: "FILTER",
      state: "inactive",
      buttonWidth: 88,
      buttonHeight: 88,
      fillColor: "",
      textColor: "",
    });

    expect(element.shadowRoot?.innerHTML).toContain("#2f3542");
    expect(element.shadowRoot?.innerHTML).toContain("#8e98ab");
  });

  it("renders all tone labels in svg-label-tones", async () => {
    const element = await renderElement<LitLikeElement>("svg-label-tones", {
      buttonWidth: 88,
      buttonHeight: 88,
    });

    expect(element.shadowRoot?.querySelectorAll("svg-label")).toHaveLength(12);
  });

  it("renders web-card as a three-section composition with stacked labels", async () => {
    const element = await renderElement<LitLikeElement>("web-card", {
      headerLabel: "HEADER",
      mainLabel: "MAIN",
      footerLabel: "FOOTER",
    });

    expect(element.shadowRoot?.querySelectorAll("svg-label")).toHaveLength(3);
    expect(element.shadowRoot?.querySelectorAll("section")).toHaveLength(3);
    expect(element.shadowRoot?.innerHTML).toContain("HEADER");
    expect(element.shadowRoot?.innerHTML).toContain("MAIN");
    expect(element.shadowRoot?.innerHTML).toContain("FOOTER");
    expect(element.shadowRoot?.querySelectorAll("slot")).toHaveLength(3);
  });

  it("renders volume-web-card with a knob and angular footer label", async () => {
    const element = await renderElement<LitLikeElement>("volume-web-card", {
      angle: 135,
    });

    const card = element.shadowRoot?.querySelector("web-card") as LitLikeElement | null;
    await card?.updateComplete;

    expect(card).not.toBeNull();
    expect(card?.shadowRoot?.querySelectorAll("svg-label")).toHaveLength(2);
    expect(card?.querySelector("sequencer-knob-button")).not.toBeNull();
    expect(card?.shadowRoot?.innerHTML).toContain("VOLUME");
    expect(card?.shadowRoot?.innerHTML).toContain("135");
    expect(card?.querySelector('[slot="footer"]')).toBeNull();
  });

  it("updates the volume-web-card footer label when the knob angle changes", async () => {
    const element = await renderElement<LitLikeElement>("volume-web-card", {
      angle: 90,
    });

    const knob = element.shadowRoot?.querySelector("sequencer-knob-button") as LitLikeElement | null;
    knob?.dispatchEvent(
      new CustomEvent<IKnobButtonCircularDraggingDetail>(
        KnobButtonEvents.circularDraggingChanged,
        {
          detail: {
            variant: "matte",
            angle: 210,
            sample: {
              isDragging: true,
              direction: "cw",
              angleRadians: 0,
              deltaRadians: 0,
              angularVelocity: 0,
              normalizedSpeed: 0,
              radius: 40,
              pointer: { x: 0, y: 0 },
              center: { x: 0, y: 0 },
              timestamp: 0,
            },
          },
          bubbles: true,
          composed: true,
        },
      ),
    );

    await element.updateComplete;
    const card = element.shadowRoot?.querySelector("web-card") as LitLikeElement | null;
    await card?.updateComplete;

    expect(card?.shadowRoot?.innerHTML).toContain("210");
  });

  it("dispatches transport press intent from play-button", async () => {
    const element = await renderElement<LitLikeElement>("play-button", {
      variant: "record",
      label: "arm",
    });

    const eventPromise = new Promise<{ variant: string } | undefined>((resolve) => {
      element.addEventListener(TransportButtonEvents.pressed, (event) => {
        resolve((event as CustomEvent<{ variant: string }>).detail);
      }, { once: true });
    });

    (element.shadowRoot?.querySelector("button") as HTMLButtonElement).click();

    expect(await eventPromise).toEqual({ variant: "record" });
    expect(element.shadowRoot?.querySelector("button")?.getAttribute("aria-label")).toBe("record arm");
  });

  it("renders play buttons and shift button in sequencer-transport-row", async () => {
    const element = await renderElement<LitLikeElement>("sequencer-transport-row", {
      layout: "transport-shift",
    });

    expect(element.shadowRoot?.querySelectorAll("play-button")).toHaveLength(3);
    expect(element.shadowRoot?.querySelectorAll("sequencer-shift-button")).toHaveLength(1);
  });

  it("dispatches shift press from sequencer-shift-button", async () => {
    const element = await renderElement<LitLikeElement>("sequencer-shift-button", {
      label: "ALT",
    });

    const eventPromise = new Promise<string>((resolve) => {
      element.addEventListener(ShiftButtonEvents.pressed, () => {
        resolve(ShiftButtonEvents.pressed);
      }, { once: true });
    });

    (element.shadowRoot?.querySelector("button") as HTMLButtonElement).click();

    expect(await eventPromise).toBe(ShiftButtonEvents.pressed);
    expect(element.shadowRoot?.innerHTML).toContain("ALT");
  });
});
