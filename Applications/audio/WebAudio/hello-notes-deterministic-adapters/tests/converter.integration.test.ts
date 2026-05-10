import { describe, expect, it } from "vitest";
import * as abcjs from "abcjs";

import { Converter, Song } from "../src/index.js";

describe("Converter integration", () => {
  it("converts song to ABC notation through RxJS pipeline and abcjs parses it", async () => {
    const converter = new Converter();
    const song = new Song();
    expect(song.get()).toBe(
      "C4-h500-v92-ch1 C4-h500-v92-ch1 G4-h500-v92-ch1 G4-h500-v92-ch1 A4-h500-v92-ch1 A4-h500-v92-ch1 G4-h1000-v92-ch1 F4-h500-v88-ch1 F4-h500-v88-ch1 E4-h500-v88-ch1 E4-h500-v88-ch1 D4-h500-v88-ch1 D4-h500-v88-ch1 C4-h1000-v88-ch1",
    );

    const abc = await converter.convertToAbc(song);

    expect(normalizeAbc(abc)).toBe(
      normalizeAbc(
        [
          "X:1",
          "T:Song",
          "M:4/4",
          "L:1/8",
          "Q:120",
          "K:C",
          "C2 C2 G2 G2 A2 A2 G4 | F2 F2 E2 E2 D2 D2 C4 |",
        ].join("\n"),
      ),
    );

    const parsed = abcjs.parseOnly(abc);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });
});

function normalizeAbc(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .join("\n")
    .trim();
}
