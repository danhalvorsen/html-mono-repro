// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  PianoRootConfigurationFactory,
  type PianoRootConfiguration,
} from "../PianoRootConfiguration";
import type { PianoRoot } from "../piano-root";
import type { PianoWaterfallNew } from "../../waterfall/piano-waterfall-new";
import type { ColumnWc } from "../../waterfall/piano-waterfall-column";
import "../piano-root";
import "../../waterfall/piano-waterfall-new";
import "../../waterfall/piano-waterfall-column";

function createConfig(octaveWidth: number): PianoRootConfiguration {
  return new PianoRootConfigurationFactory().create({
    octaveCount: 1,
    rootPosition: { x: 0, y: 0 },
    octaveSize: { x: octaveWidth, y: (octaveWidth * 150) / 164.5 },
    octaveStartPosition: { x: 0, y: (octaveWidth * 150) / 164.5 },
    octaveGap: 6,
    waterfallPosition: { x: 0, y: 0 },
    waterfallHeightRatioToOctaveHeight: 1,
    maxSimultaneousOctaves: 2,
    midiTempoBpm: 130,
    playbackSpeed: 1,
    midiSignalRate: 1,
  });
}

describe("piano root -> waterfall reactivity", () => {
  it("updates waterfall column widths when piano configuration changes", async () => {
    const root = document.createElement("piano-root-new") as PianoRoot;
    const waterfall = document.createElement("piano-waterfall-new") as PianoWaterfallNew;
    const column = document.createElement("column-wc") as ColumnWc;

    column.slot = "column-0";
    waterfall.appendChild(column);
    root.appendChild(waterfall);
    document.body.appendChild(root);

    const firstConfig = createConfig(300);
    root.options = firstConfig;
    await root.updateComplete;
    await waterfall.updateComplete;
    await column.updateComplete;

    const firstWidth = column.options.size.x;
    expect(firstWidth).toBeGreaterThan(0);

    const secondConfig = createConfig(600);
    root.options = secondConfig;
    await root.updateComplete;
    await waterfall.updateComplete;
    await column.updateComplete;

    const secondWidth = column.options.size.x;

    expect(waterfall.options).toBe(secondConfig.waterfall);
    expect(secondWidth).toBeGreaterThan(firstWidth);
  });
});
