// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import "../src/sequencerGrid.ts";
import {
  RgbButtonEvents,
  type IRgbButtonToggleRequestedDetail,
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

describe("sequencer-grid projection", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should expose track projections with track id and step states", async () => {
    const grid = document.createElement("sequencer-grid") as HTMLElement & {
      trackCount: number;
      stepCount: number;
      getTrackProjections(): readonly {
        readonly trackId: number;
        readonly selected: boolean;
        readonly stepStates: readonly boolean[];
      }[];
    };

    grid.trackCount = 2;
    grid.stepCount = 4;
    document.body.append(grid);

    await waitForLitUpdate(grid);

    const projection = grid.getTrackProjections();
    expect(projection).toHaveLength(2);
    expect(projection[0]?.trackId).toBe(0);
    expect(projection[1]?.trackId).toBe(1);
    expect(projection[0]?.selected).toBe(true);
    expect(projection[1]?.selected).toBe(true);
    expect(projection[0]?.stepStates).toEqual([false, false, false, false]);
    expect(projection[1]?.stepStates).toEqual([false, false, false, false]);
  });

  it("should project selection state provided by application layer", async () => {
    const grid = document.createElement("sequencer-grid") as HTMLElement & {
      trackCount: number;
      stepCount: number;
      setTrackSelectionStates(
        states: readonly { readonly trackId: number; readonly selected: boolean }[],
      ): void;
      getTrackProjections(): readonly {
        readonly trackId: number;
        readonly selected: boolean;
        readonly stepStates: readonly boolean[];
      }[];
    };

    grid.trackCount = 2;
    grid.stepCount = 4;
    grid.setTrackSelectionStates([{ trackId: 0, selected: false }]);
    document.body.append(grid);

    await waitForLitUpdate(grid);

    const projection = grid.getTrackProjections();
    expect(projection).toHaveLength(2);
    expect(projection[0]?.selected).toBe(false);
    expect(projection[1]?.selected).toBe(true);
  });

  it("should mark a step as active in projection when the track step toggles on", async () => {
    const grid = document.createElement("sequencer-grid") as HTMLElement & {
      trackCount: number;
      stepCount: number;
      getTrackProjections(): readonly {
        readonly trackId: number;
        readonly selected: boolean;
        readonly stepStates: readonly boolean[];
      }[];
    };

    grid.trackCount = 1;
    grid.stepCount = 4;
    document.body.append(grid);

    await waitForLitUpdate(grid);

    const track = grid.shadowRoot?.querySelector("sequencer-track");
    expect(track).toBeTruthy();
    if (!track) {
      return;
    }

    await waitForLitUpdate(track);

    const button = track.shadowRoot?.querySelector(
      'sequencer-rgb-button[data-step-index="1"]',
    );
    expect(button).toBeTruthy();
    if (!button) {
      return;
    }

    button.dispatchEvent(
      new CustomEvent<IRgbButtonToggleRequestedDetail>(RgbButtonEvents.toggleRequested, {
        detail: { r: 0, g: 0, b: 0, on: false },
        bubbles: true,
        composed: true,
      }),
    );

    await waitForLitUpdate(track);

    const projection = grid.getTrackProjections();
    expect(projection).toHaveLength(1);
    expect(projection[0]?.selected).toBe(true);
    expect(projection[0]?.stepStates).toEqual([false, true, false, false]);
  });

  it("should render and highlight the indicator row only for the active playing column", async () => {
    const grid = document.createElement("sequencer-grid") as HTMLElement & {
      trackCount: number;
      stepCount: number;
      setColumnIndicatorProjection(
        projection: {
          readonly enabled: boolean;
          readonly playing: boolean;
          readonly currentColumn: number;
        },
      ): void;
    };

    grid.trackCount = 1;
    grid.stepCount = 4;
    grid.setColumnIndicatorProjection({
      enabled: true,
      playing: false,
      currentColumn: 1,
    });
    document.body.append(grid);
    await waitForLitUpdate(grid);

    const firstRenderButtons = grid.shadowRoot?.querySelectorAll(
      ".column-indicator-button",
    );
    const indicatorRow = grid.shadowRoot?.querySelector(".column-indicator-row");
    expect(firstRenderButtons?.length).toBe(4);
    expect(firstRenderButtons?.[0]?.getAttribute("style")).toContain("height:22px");
    expect(indicatorRow?.getAttribute("style")).toContain("margin-inline-start: 96px");
    for (const button of firstRenderButtons ?? []) {
      expect(button.getAttribute("data-active")).toBe("false");
    }

    grid.setColumnIndicatorProjection({
      enabled: true,
      playing: true,
      currentColumn: 2,
    });
    await waitForLitUpdate(grid);

    const secondRenderButtons = grid.shadowRoot?.querySelectorAll(
      ".column-indicator-button",
    );
    expect(secondRenderButtons?.[3]?.getAttribute("data-active")).toBe("true");
    expect(secondRenderButtons?.[0]?.getAttribute("data-active")).toBe("false");
    expect(secondRenderButtons?.[1]?.getAttribute("data-active")).toBe("false");
    expect(secondRenderButtons?.[2]?.getAttribute("data-active")).toBe("false");
  });
});
