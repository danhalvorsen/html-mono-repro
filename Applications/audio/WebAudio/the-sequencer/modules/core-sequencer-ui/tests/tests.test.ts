// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  SequencerControlEvents,
  type ISequencerControlBpmRequestedDetail,
  type ISequencerControlColumnIndicatorToggleRequestedDetail,
  type ISequencerControlTransportRequestedDetail,
} from "../src/sequencerControl.ts";
import {
  TransportButtonEvents,
  type ITransportButtonPressedDetail,
} from "@monorepo/core.sequencer.ui.resources";

type LitLikeElement = Element & { updateComplete?: Promise<unknown> };

async function waitForLitUpdate(element: Element): Promise<void> {
  const maybeLitElement = element as LitLikeElement;
  if (maybeLitElement.updateComplete) {
    await maybeLitElement.updateComplete;
    return;
  }

  await Promise.resolve();
}

describe("sequencer-control", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should render play and stop buttons with id and address metadata", async () => {
    const host = document.createElement("sequencer-control");
    document.body.append(host);
    await waitForLitUpdate(host);

    const root = host.shadowRoot;
    expect(root).toBeTruthy();

    const controls = root?.querySelectorAll(
      "play-button[data-id], stop-button[data-id]",
    );
    expect(controls).toHaveLength(2);
    const bpmButtons = root?.querySelectorAll("button.bpm-button");
    expect(bpmButtons).toHaveLength(3);
    const featureButtons = root?.querySelectorAll("button.feature-button");
    expect(featureButtons).toHaveLength(1);

    const bpmRow = root?.querySelector(".bpm-row");
    const transportRow = root?.querySelector(".transport-row");
    expect(bpmRow).toBeTruthy();
    expect(transportRow).toBeTruthy();
    if (bpmRow && transportRow) {
      const bpmPosition = bpmRow.compareDocumentPosition(transportRow);
      expect((bpmPosition & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true);
    }

    const playButton = root?.querySelector("#play-0-4");
    expect(playButton).toBeTruthy();
    expect(playButton?.getAttribute("data-id")).toBe("play");
    expect(playButton?.getAttribute("address")).toBe("[0,4]");
    expect(playButton?.getAttribute("data-button-spec")).toBe("[\"play\",0,4]");

    const stopButton = root?.querySelector("#stop-1-4");
    expect(stopButton).toBeTruthy();
    expect(stopButton?.getAttribute("data-id")).toBe("stop");
    expect(stopButton?.getAttribute("address")).toBe("[1,4]");
    expect(stopButton?.getAttribute("data-button-spec")).toBe("[\"stop\",1,4]");
  });

  it("should render stop-button as a stop variant of play-button", async () => {
    const host = document.createElement("sequencer-control");
    document.body.append(host);
    await waitForLitUpdate(host);

    const stopButton = host.shadowRoot?.querySelector("stop-button");
    expect(stopButton).toBeTruthy();
    if (!stopButton) return;

    await waitForLitUpdate(stopButton);
    const innerTransport = stopButton.shadowRoot?.querySelector("play-button");
    expect(innerTransport).toBeTruthy();
    expect(innerTransport?.getAttribute("variant")).toBe("stop");
  });

  it("should fall back to default dimensions when configured dimensions are invalid", async () => {
    const host = document.createElement("sequencer-control");
    host.setAttribute("button-width", "0");
    host.setAttribute("button-height", "-10");
    host.setAttribute("gap", "0");
    document.body.append(host);
    await waitForLitUpdate(host);

    const grid = host.shadowRoot?.querySelector(".control-grid");
    const bpmRow = host.shadowRoot?.querySelector(".bpm-row");
    const transportRow = host.shadowRoot?.querySelector(".transport-row");

    const gridStyle = grid?.getAttribute("style") ?? "";
    const bpmRowStyle = bpmRow?.getAttribute("style") ?? "";
    const transportRowStyle = transportRow?.getAttribute("style") ?? "";

    expect(gridStyle).toContain("row-gap: 8px");
    expect(bpmRowStyle).toContain("repeat(3, 88px)");
    expect(bpmRowStyle).toContain("column-gap: 8px");
    expect(transportRowStyle).toContain("repeat(3, 88px)");
    expect(transportRowStyle).toContain("column-gap: 8px");
  });

  it("should emit sequencer transport intent with id and address when a transport button is pressed", async () => {
    const host = document.createElement("sequencer-control");
    const observed: ISequencerControlTransportRequestedDetail[] = [];
    host.addEventListener(SequencerControlEvents.transportRequested, (event) => {
      observed.push(
        (event as CustomEvent<ISequencerControlTransportRequestedDetail>).detail,
      );
    });

    document.body.append(host);
    await waitForLitUpdate(host);

    const playButton = host.shadowRoot?.querySelector("#play-0-4");
    expect(playButton).toBeTruthy();
    if (!playButton) {
      return;
    }

    playButton.dispatchEvent(
      new CustomEvent<ITransportButtonPressedDetail>(TransportButtonEvents.pressed, {
        detail: { variant: "play" },
        bubbles: true,
        composed: true,
      }),
    );

    expect(observed).toEqual([
      {
        id: "play",
        address: [0, 4],
      },
    ]);
  });

  it("should emit bpm request and activate selected bpm button", async () => {
    const host = document.createElement("sequencer-control");
    const observed: ISequencerControlBpmRequestedDetail[] = [];
    host.addEventListener(SequencerControlEvents.bpmRequested, (event) => {
      observed.push(
        (event as CustomEvent<ISequencerControlBpmRequestedDetail>).detail,
      );
    });

    document.body.append(host);
    await waitForLitUpdate(host);

    const bpmButton = host.shadowRoot?.querySelector(
      'button.bpm-button[data-bpm="160"]',
    );
    expect(bpmButton).toBeTruthy();
    if (!bpmButton) {
      return;
    }

    bpmButton.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await waitForLitUpdate(host);

    const selectedButton = host.shadowRoot?.querySelector(
      'button.bpm-button[data-bpm="160"]',
    );
    expect(selectedButton?.getAttribute("data-active")).toBe("true");

    expect(observed).toEqual([
      {
        bpm: 160,
        address: [4, 4],
      },
    ]);
  });

  it("should mark play as active and stop as inactive when playing is true", async () => {
    const host = document.createElement("sequencer-control") as HTMLElement & {
      playing: boolean;
    };
    host.playing = true;

    document.body.append(host);
    await waitForLitUpdate(host);

    const playButton = host.shadowRoot?.querySelector("#play-0-4");
    const stopButton = host.shadowRoot?.querySelector("#stop-1-4");

    expect(playButton?.getAttribute("data-active")).toBe("true");
    expect(stopButton?.getAttribute("data-active")).toBe("false");
  });

  it("should toggle indicator feature and emit indicator toggle intent", async () => {
    const host = document.createElement("sequencer-control") as HTMLElement & {
      columnIndicatorEnabled: boolean;
    };
    const observed: ISequencerControlColumnIndicatorToggleRequestedDetail[] = [];
    host.addEventListener(
      SequencerControlEvents.columnIndicatorToggleRequested,
      (event) => {
        observed.push(
          (
            event as CustomEvent<ISequencerControlColumnIndicatorToggleRequestedDetail>
          ).detail,
        );
      },
    );

    document.body.append(host);
    await waitForLitUpdate(host);

    const featureButton = host.shadowRoot?.querySelector(
      'button.feature-button[data-feature-id="column-indicator"]',
    );
    expect(featureButton).toBeTruthy();
    if (!featureButton) {
      return;
    }

    featureButton.dispatchEvent(
      new MouseEvent("click", { bubbles: true, composed: true }),
    );
    await waitForLitUpdate(host);

    expect(host.columnIndicatorEnabled).toBe(true);
    expect(featureButton.getAttribute("data-active")).toBe("true");
    expect(observed).toEqual([
      {
        enabled: true,
        address: [5, 4],
      },
    ]);
  });
});
