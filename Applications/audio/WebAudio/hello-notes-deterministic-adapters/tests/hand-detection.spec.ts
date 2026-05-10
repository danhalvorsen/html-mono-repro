import { describe, expect, it } from "vitest";
import { analyzeHandDetection, type HandDetectionNote } from "../src/index.js";

describe("Deterministic hand detection specification", () => {
  describe("Ground truth fixtures", () => {
    it("detects dual-hand from labeled two-hand piano fixture", () => {
      const result = analyzeHandDetection(twoHandPianoFixture());
      expect(result.classification).toBe("dualHand");
    });

    it("detects single-hand from labeled right-hand melody fixture", () => {
      const result = analyzeHandDetection(rightHandMelodyFixture());
      expect(result.classification).toBe("singleHand");
    });

    it("detects single-hand from labeled left-hand bass fixture", () => {
      const result = analyzeHandDetection(leftHandBassFixture());
      expect(result.classification).toBe("singleHand");
    });

    it("detects dual-hand from Alberti bass plus melody fixture", () => {
      const result = analyzeHandDetection(albertiPlusMelodyFixture());
      expect(result.classification).toBe("dualHand");
    });

    it("detects dual-hand from block chord plus melody fixture", () => {
      const result = analyzeHandDetection(blockChordPlusMelodyFixture());
      expect(result.classification).toBe("dualHand");
    });

    it("keeps fixture classifications stable across repeated runs", () => {
      const fixture = albertiPlusMelodyFixture();
      const first = analyzeHandDetection(fixture);
      const second = analyzeHandDetection(fixture);
      expect(second).toEqual(first);
    });
  });

  describe("Windowed analysis", () => {
    it("analyzes hand usage in deterministic time windows", () => {
      const result = analyzeHandDetection(windowedMixedFixture(), { windowMs: 1000 });
      expect(result.windows.length).toBeGreaterThan(1);
      expect(result.windows[0]?.startMs).toBe(0);
      expect(result.windows[0]?.endMs).toBe(1000);
      expect(result.windows[1]?.startMs).toBe(1000);
      expect(result.windows[1]?.endMs).toBe(2000);
    });

    it("does not classify an entire song as dual-hand from one isolated wide chord", () => {
      const result = analyzeHandDetection(isolatedWideChordFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("classifies dual-hand only inside windows with sufficient evidence", () => {
      const result = analyzeHandDetection(windowedMixedFixture(), { windowMs: 1000 });
      const dualCount = result.windows.filter((window) => window.classification === "dualHand").length;
      const singleCount = result.windows.filter((window) => window.classification === "singleHand").length;
      expect(dualCount).toBeGreaterThan(0);
      expect(singleCount).toBeGreaterThan(0);
    });

    it("merges adjacent compatible dual-hand windows deterministically", () => {
      const result = analyzeHandDetection(adjacentDualWindowsFixture(), { windowMs: 1000 });
      const dualWindows = result.windows.filter((window) => window.classification === "dualHand");
      expect(dualWindows).toHaveLength(1);
      expect(dualWindows[0]?.startMs).toBe(0);
      expect(dualWindows[0]?.endMs).toBe(2000);
    });

    it("keeps separated single-hand and dual-hand sections as separate windows", () => {
      const result = analyzeHandDetection(separatedSectionsFixture(), { windowMs: 1000 });
      expect(result.windows.map((window) => window.classification)).toEqual([
        "dualHand",
        "singleHand",
      ]);
    });
  });

  describe("Pedal and sustain handling", () => {
    it("distinguishes physical key-down overlap from sustain-pedal sounding overlap", () => {
      const physical = analyzeHandDetection(physicalOverlapFixture(), { windowMs: 1000 });
      const sustained = analyzeHandDetection(sustainOnlyOverlapFixture(), { windowMs: 1000 });
      expect(physical.classification).toBe("dualHand");
      expect(sustained.classification).toBe("singleHand");
    });

    it("does not treat sustain-pedal overlap alone as two-hand evidence", () => {
      const result = analyzeHandDetection(sustainOnlyOverlapFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("uses note-off timing for physical hand analysis", () => {
      const result = analyzeHandDetection(keyUpTimingFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("uses sustained sounding duration only for playback/rendering metadata", () => {
      const result = analyzeHandDetection(sustainOnlyOverlapFixture(), { windowMs: 1000 });
      expect(result.windows.some((window) => window.classification === "dualHand")).toBe(false);
    });
  });

  describe("False-positive protection", () => {
    it("does not classify close-position triads as dual-hand by overlap alone", () => {
      const result = analyzeHandDetection(closePositionTriadFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("does not classify repeated arpeggios as dual-hand without independent-line evidence", () => {
      const result = analyzeHandDetection(repeatedArpeggioFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("does not classify legato single-line playing as dual-hand", () => {
      const result = analyzeHandDetection(legatoSingleLineFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("does not classify grace-note ornamentation as dual-hand", () => {
      const result = analyzeHandDetection(graceOrnamentFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });

    it("does not classify tremolo between nearby notes as dual-hand", () => {
      const result = analyzeHandDetection(nearbyTremoloFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });
  });

  describe("Ambiguity handling", () => {
    it("returns ambiguous when evidence is insufficient for single-hand or dual-hand", () => {
      const result = analyzeHandDetection(ambiguousSparseFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("ambiguous");
    });

    it("does not force dual-hand classification for borderline pitch separation", () => {
      const result = analyzeHandDetection(borderlinePitchSeparationFixture(), { windowMs: 1000 });
      expect(result.classification).not.toBe("dualHand");
    });

    it("does not force single-hand classification for sparse wide-register input", () => {
      const result = analyzeHandDetection(ambiguousSparseFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("ambiguous");
    });

    it("emits ambiguity reasons in metadata", () => {
      const result = analyzeHandDetection(ambiguousSparseFixture(), { windowMs: 1000 });
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons).toContain("thresholdGate");
    });
  });

  describe("Evidence thresholds", () => {
    it("requires minimum note count before dual-hand classification", () => {
      const result = analyzeHandDetection(dualLikeButFewNotesFixture(), {
        minNoteCountForDual: 6,
      });
      expect(result.classification).toBe("ambiguous");
    });

    it("requires minimum temporal coverage before dual-hand classification", () => {
      const result = analyzeHandDetection(dualLikeShortCoverageFixture(), {
        minCoverageMsForDual: 1600,
      });
      expect(result.classification).toBe("ambiguous");
    });

    it("requires minimum confidence before emitting dual-hand result", () => {
      const result = analyzeHandDetection(twoHandPianoFixture(), {
        minConfidenceForDual: 0.95,
      });
      expect(result.classification).toBe("singleHand");
    });

    it("allows threshold values to be configured", () => {
      const strict = analyzeHandDetection(twoHandPianoFixture(), {
        minConfidenceForDual: 0.95,
      });
      const relaxed = analyzeHandDetection(twoHandPianoFixture(), {
        minConfidenceForDual: 0.2,
      });
      expect(strict.classification).not.toBe(relaxed.classification);
    });

    it("keeps threshold decisions deterministic", () => {
      const config = { minConfidenceForDual: 0.7, minCoverageMsForDual: 700 };
      const first = analyzeHandDetection(twoHandPianoFixture(), config);
      const second = analyzeHandDetection(twoHandPianoFixture(), config);
      expect(second).toEqual(first);
    });
  });

  describe("Overlap as evidence", () => {
    it("uses temporal overlap as evidence, not proof, of dual-hand playing", () => {
      const result = analyzeHandDetection(isolatedWideChordFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
      expect(result.evidence.wideOverlapPairs).toBeGreaterThan(0);
    });

    it("weights overlap evidence higher when pitch distance is large", () => {
      const wide = analyzeHandDetection(physicalOverlapFixture(), { windowMs: 1000 });
      const close = analyzeHandDetection(closePositionTriadFixture(), { windowMs: 1000 });
      expect(wide.evidence.wideOverlapPairs).toBeGreaterThan(close.evidence.wideOverlapPairs);
    });

    it("weights overlap evidence lower when notes form a playable close-position chord", () => {
      const result = analyzeHandDetection(closePositionTriadFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
      expect(result.evidence.closeOverlapPairs).toBeGreaterThan(0);
    });

    it("does not allow overlap evidence alone to override stronger single-hand continuity", () => {
      const result = analyzeHandDetection(isolatedWideChordFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("singleHand");
    });
  });

  describe("Playable span constraints", () => {
    it("classifies simultaneous notes beyond configured playable hand span as dual-hand evidence", () => {
      const result = analyzeHandDetection(twoHandPianoFixture(), { maxSingleHandSpan: 10 });
      expect(result.evidence.spanExceededPairs).toBeGreaterThan(0);
    });

    it("does not classify simultaneous notes within configured playable hand span as dual-hand by span alone", () => {
      const result = analyzeHandDetection(closePositionTriadFixture(), { maxSingleHandSpan: 12 });
      expect(result.evidence.spanExceededPairs).toBe(0);
      expect(result.classification).not.toBe("dualHand");
    });

    it("supports configurable maximum single-hand span", () => {
      const tight = analyzeHandDetection(blockChordPlusMelodyFixture(), { maxSingleHandSpan: 8 });
      const wide = analyzeHandDetection(blockChordPlusMelodyFixture(), { maxSingleHandSpan: 20 });
      expect(tight.evidence.spanExceededPairs).toBeGreaterThan(wide.evidence.spanExceededPairs);
    });

    it("records span-based evidence in metadata", () => {
      const result = analyzeHandDetection(twoHandPianoFixture(), { maxSingleHandSpan: 10 });
      expect(result.evidence.spanExceededPairs).toBeGreaterThan(0);
    });
  });

  describe("Hand center tracking", () => {
    it("tracks left-hand and right-hand pitch centers per analysis window", () => {
      const result = analyzeHandDetection(twoHandPianoFixture(), { windowMs: 1000 });
      const windowsWithCenters = result.windows.filter((window) => window.handCenters !== undefined);
      expect(windowsWithCenters.length).toBeGreaterThan(0);
      for (const window of windowsWithCenters) {
        expect(window.handCenters!.left).toBeLessThan(window.handCenters!.right);
      }
    });

    it("updates hand centers deterministically after confident assignments", () => {
      const first = analyzeHandDetection(twoHandPianoFixture(), { windowMs: 1000 });
      const second = analyzeHandDetection(twoHandPianoFixture(), { windowMs: 1000 });
      expect(second.handCenterState).toEqual(first.handCenterState);
    });

    it("does not update hand centers from ambiguous notes", () => {
      const result = analyzeHandDetection(ambiguousSparseFixture(), { windowMs: 1000 });
      expect(result.classification).toBe("ambiguous");
      expect(result.handCenterState).toBeUndefined();
      expect(result.windows.every((window) => window.handCenters === undefined)).toBe(true);
    });

    it("uses hand centers to reduce assignment oscillation", () => {
      const result = analyzeHandDetection(oscillationFixture(), {
        windowMs: 500,
        handCenterSmoothing: 0.8,
      });
      const centers = result.windows
        .map((window) => window.handCenters)
        .filter((center): center is NonNullable<typeof center> => center !== undefined);
      expect(centers.length).toBeGreaterThan(0);
      if (centers.length > 1) {
        const leftDelta = Math.abs(centers[centers.length - 1]!.left - centers[0]!.left);
        const rightDelta = Math.abs(centers[centers.length - 1]!.right - centers[0]!.right);
        expect(leftDelta).toBeLessThan(15);
        expect(rightDelta).toBeLessThan(15);
      }
      expect(result.handCenterState).toBeDefined();
    });
  });

  describe("Classification model", () => {
    it("supports singleHand classification", () => {
      const result = analyzeHandDetection(rightHandMelodyFixture());
      expect(result.classification).toBe("singleHand");
    });

    it("supports dualHand classification", () => {
      const result = analyzeHandDetection(twoHandPianoFixture());
      expect(result.classification).toBe("dualHand");
    });

    it("supports ambiguous classification", () => {
      const result = analyzeHandDetection(ambiguousSparseFixture());
      expect(result.classification).toBe("ambiguous");
    });

    it("keeps classification result stable for identical input and configuration", () => {
      const config = { windowMs: 1000, maxSingleHandSpan: 12 };
      const first = analyzeHandDetection(twoHandPianoFixture(), config);
      const second = analyzeHandDetection(twoHandPianoFixture(), config);
      expect(second.classification).toBe(first.classification);
      expect(second.confidence).toBe(first.confidence);
    });
  });
});

function twoHandPianoFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 500),
    note(72, 0, 500),
    note(50, 500, 500),
    note(74, 500, 500),
    note(52, 1000, 500),
    note(76, 1000, 500),
  ];
}

function rightHandMelodyFixture(): readonly HandDetectionNote[] {
  return [
    note(72, 0, 400),
    note(74, 450, 400),
    note(76, 900, 400),
    note(77, 1350, 400),
  ];
}

function leftHandBassFixture(): readonly HandDetectionNote[] {
  return [
    note(40, 0, 600),
    note(43, 700, 600),
    note(45, 1400, 600),
  ];
}

function albertiPlusMelodyFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 250),
    note(55, 250, 250),
    note(52, 500, 250),
    note(55, 750, 250),
    note(72, 0, 1000),
    note(74, 1000, 1000),
  ];
}

function blockChordPlusMelodyFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 700),
    note(52, 0, 700),
    note(55, 0, 700),
    note(76, 0, 700),
    note(77, 750, 500),
  ];
}

function note(noteNumber: number, startMs: number, durationMs: number): HandDetectionNote {
  return {
    noteNumber,
    startMs,
    durationMs,
    velocity: 96,
    channel: 1,
  };
}

function physicalOverlapFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 700),
    note(74, 200, 700),
    note(50, 1200, 300),
    note(76, 1200, 300),
  ];
}

function sustainOnlyOverlapFixture(): readonly HandDetectionNote[] {
  return [
    {
      ...note(48, 0, 1200),
      keyUpMs: 150,
      sustainedOnly: false,
    },
    {
      ...note(74, 200, 800),
      keyUpMs: 260,
      sustainedOnly: true,
    },
    note(76, 1200, 300),
  ];
}

function keyUpTimingFixture(): readonly HandDetectionNote[] {
  return [
    {
      ...note(48, 0, 900),
      keyUpMs: 100,
    },
    {
      ...note(74, 150, 800),
      keyUpMs: 220,
    },
    note(76, 1000, 300),
  ];
}

function closePositionTriadFixture(): readonly HandDetectionNote[] {
  return [
    note(60, 0, 700),
    note(64, 0, 700),
    note(67, 0, 700),
    note(62, 800, 300),
  ];
}

function repeatedArpeggioFixture(): readonly HandDetectionNote[] {
  return [
    note(60, 0, 200),
    note(64, 220, 200),
    note(67, 440, 200),
    note(72, 660, 200),
    note(60, 880, 200),
    note(64, 1100, 200),
    note(67, 1320, 200),
    note(72, 1540, 200),
  ];
}

function legatoSingleLineFixture(): readonly HandDetectionNote[] {
  return [
    note(67, 0, 420),
    note(69, 360, 420),
    note(71, 720, 420),
    note(72, 1080, 420),
  ];
}

function graceOrnamentFixture(): readonly HandDetectionNote[] {
  return [
    note(72, 0, 350),
    note(74, 80, 60),
    note(72, 170, 280),
    note(76, 520, 320),
  ];
}

function nearbyTremoloFixture(): readonly HandDetectionNote[] {
  return [
    note(69, 0, 90),
    note(71, 110, 90),
    note(69, 220, 90),
    note(71, 330, 90),
    note(69, 440, 90),
    note(71, 550, 90),
  ];
}

function windowedMixedFixture(): readonly HandDetectionNote[] {
  return [
    note(72, 0, 300),
    note(74, 350, 300),
    note(48, 1000, 500),
    note(74, 1000, 500),
    note(50, 1500, 500),
    note(76, 1500, 500),
  ];
}

function isolatedWideChordFixture(): readonly HandDetectionNote[] {
  return [
    note(72, 0, 300),
    note(74, 350, 300),
    note(40, 1000, 700),
    note(76, 1000, 700),
    note(77, 2000, 300),
    note(79, 2350, 300),
  ];
}

function adjacentDualWindowsFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 500),
    note(72, 0, 500),
    note(50, 500, 500),
    note(74, 500, 500),
    note(52, 1000, 500),
    note(76, 1000, 500),
    note(53, 1500, 500),
    note(77, 1500, 500),
  ];
}

function separatedSectionsFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 500),
    note(72, 0, 500),
    note(50, 500, 500),
    note(74, 500, 500),
    note(72, 1000, 300),
    note(74, 1350, 300),
  ];
}

function ambiguousSparseFixture(): readonly HandDetectionNote[] {
  return [
    note(52, 0, 120),
    note(68, 900, 120),
    note(54, 2000, 120),
  ];
}

function borderlinePitchSeparationFixture(): readonly HandDetectionNote[] {
  return [
    note(60, 0, 350),
    note(67, 0, 350),
    note(62, 500, 350),
    note(69, 500, 350),
  ];
}

function dualLikeButFewNotesFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 500),
    note(74, 0, 500),
    note(50, 600, 500),
  ];
}

function dualLikeShortCoverageFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 300),
    note(72, 0, 300),
    note(50, 320, 300),
    note(74, 320, 300),
    note(52, 640, 300),
    note(76, 640, 300),
  ];
}

function oscillationFixture(): readonly HandDetectionNote[] {
  return [
    note(48, 0, 240),
    note(72, 0, 240),
    note(60, 300, 220),
    note(64, 300, 220),
    note(50, 600, 240),
    note(74, 600, 240),
    note(61, 900, 220),
    note(65, 900, 220),
    note(52, 1200, 240),
    note(76, 1200, 240),
  ];
}
