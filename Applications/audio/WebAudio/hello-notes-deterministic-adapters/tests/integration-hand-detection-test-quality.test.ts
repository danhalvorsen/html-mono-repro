import { describe, expect, it } from "vitest";
import { analyzeHandDetection, type HandDetectionNote } from "../src/index.js";

type MidiLikeEvent = {
  readonly tick: number;
  readonly kind: "on" | "off";
  readonly pitch: number;
  readonly velocity: number;
};

describe("KISS MIDI fixtures acceptance", () => {
  it("single_hand_simple_right", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 72, velocity: 90 },
      { tick: 240, kind: "off", pitch: 72, velocity: 0 },
      { tick: 240, kind: "on", pitch: 74, velocity: 90 },
      { tick: 480, kind: "off", pitch: 74, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes);

    expect(result.classification).toBe("singleHand");
    expect(result.classification).not.toBe("dualHand");
    expect(result.classification).not.toBe("ambiguous");
    expect(result.windows).toHaveLength(1);
    expect(result.windows[0]?.classification).toBe("singleHand");
    expect(result.evidence.dualWindowCount).toBe(0);
  });

  it("single_hand_simple_left", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 48, velocity: 90 },
      { tick: 240, kind: "off", pitch: 48, velocity: 0 },
      { tick: 240, kind: "on", pitch: 50, velocity: 90 },
      { tick: 480, kind: "off", pitch: 50, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes);

    expect(result.classification).toBe("singleHand");
    expect(result.classification).not.toBe("dualHand");
    expect(result.classification).not.toBe("ambiguous");
    expect(result.windows).toHaveLength(1);
    expect(result.windows[0]?.classification).toBe("singleHand");
  });

  it("dual_hand_simple_overlap", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 48, velocity: 90 },
      { tick: 0, kind: "on", pitch: 72, velocity: 90 },
      { tick: 240, kind: "off", pitch: 48, velocity: 0 },
      { tick: 240, kind: "off", pitch: 72, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes, {
      minNoteCountForDual: 2,
      minCoverageMsForDual: 200,
      minWideOverlapPairsGlobalForDual: 1,
      minWideOverlapPairsPerWindow: 1,
      minConfidenceForDual: 0.2,
    });

    expect(result.classification).toBe("dualHand");
    expect(result.evidence.wideOverlapPairs).toBeGreaterThan(0);
    expect(result.windows).toHaveLength(1);
    expect(result.windows[0]?.classification).toBe("dualHand");
    expect(result.reasons).toEqual(expect.arrayContaining(["overlapWideInterval"]));
    expect(result.handCenterState?.left).toBeLessThan(result.handCenterState?.right ?? Number.POSITIVE_INFINITY);
  });

  it("dual_hand_simple_span", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 40, velocity: 90 },
      { tick: 0, kind: "on", pitch: 76, velocity: 90 },
      { tick: 240, kind: "off", pitch: 40, velocity: 0 },
      { tick: 240, kind: "off", pitch: 76, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes, {
      minNoteCountForDual: 2,
      minCoverageMsForDual: 200,
      minWideOverlapPairsGlobalForDual: 1,
      minConfidenceForDual: 0.2,
      maxSingleHandSpan: 12,
    });

    expect(result.classification).toBe("dualHand");
    expect(result.evidence.spanExceededPairs).toBeGreaterThan(0);
    expect(result.reasons).toEqual(expect.arrayContaining(["spanExceeded"]));
    expect(result.handCenterState?.left).toBeLessThan(result.handCenterState?.right ?? Number.POSITIVE_INFINITY);
  });

  it("ambiguous_simple", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 48, velocity: 90 },
      { tick: 240, kind: "off", pitch: 48, velocity: 0 },
      { tick: 480, kind: "on", pitch: 72, velocity: 90 },
      { tick: 720, kind: "off", pitch: 72, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes, {
      minNoteCountForDual: 4,
      minCoverageMsForDual: 1000,
    });

    expect(result.classification).toBe("ambiguous");
    expect(result.reasons).toContain("thresholdGate");
    expect(result.handCenterState).toBeUndefined();
  });

  it("single_hand_tremolo_minimal", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 60, velocity: 90 },
      { tick: 120, kind: "off", pitch: 60, velocity: 0 },
      { tick: 120, kind: "on", pitch: 67, velocity: 90 },
      { tick: 240, kind: "off", pitch: 67, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes);

    expect(result.classification).toBe("singleHand");
    expect(result.classification).not.toBe("dualHand");
    expect(result.windows[0]?.classification).toBe("singleHand");
  });

  it("pedal_overlap_minimal", () => {
    const notes = [
      { ...note(60, 0, 200), keyUpMs: 200, sustainedOnly: false },
      { ...note(64, 200, 200), keyUpMs: 400, sustainedOnly: true },
    ] satisfies readonly HandDetectionNote[];

    const result = analyzeHandDetection(notes);

    expect(result.classification).toBe("singleHand");
    expect(result.classification).not.toBe("dualHand");
    expect(result.evidence.wideOverlapPairs).toBe(0);
  });

  it("dual_hand_polyphonic_minimal", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 55, velocity: 90 },
      { tick: 0, kind: "on", pitch: 72, velocity: 90 },
      { tick: 240, kind: "off", pitch: 55, velocity: 0 },
      { tick: 240, kind: "off", pitch: 72, velocity: 0 },
      { tick: 240, kind: "on", pitch: 57, velocity: 90 },
      { tick: 240, kind: "on", pitch: 74, velocity: 90 },
      { tick: 480, kind: "off", pitch: 57, velocity: 0 },
      { tick: 480, kind: "off", pitch: 74, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes, {
      minNoteCountForDual: 4,
      minCoverageMsForDual: 400,
      minWideOverlapPairsGlobalForDual: 2,
      minConfidenceForDual: 0.2,
    });

    expect(result.classification).toBe("dualHand");
    expect(result.evidence.wideOverlapPairs).toBeGreaterThan(1);
    expect(result.reasons).toEqual(expect.arrayContaining(["overlapWideInterval"]));
  });

  it("crossing_minimal", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 55, velocity: 90 },
      { tick: 0, kind: "on", pitch: 72, velocity: 90 },
      { tick: 240, kind: "off", pitch: 55, velocity: 0 },
      { tick: 240, kind: "off", pitch: 72, velocity: 0 },
      { tick: 240, kind: "on", pitch: 60, velocity: 90 },
      { tick: 240, kind: "on", pitch: 68, velocity: 90 },
      { tick: 480, kind: "off", pitch: 60, velocity: 0 },
      { tick: 480, kind: "off", pitch: 68, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes, {
      minNoteCountForDual: 4,
      minCoverageMsForDual: 400,
      minWideOverlapPairsGlobalForDual: 2,
      minConfidenceForDual: 0.2,
    });

    expect(result.classification).toBe("dualHand");
    expect(result.handCenterState?.left).toBeLessThan(result.handCenterState?.right ?? Number.POSITIVE_INFINITY);
  });

  it("single_hand_fast_alt_minimal", () => {
    const notes = toNotes([
      { tick: 0, kind: "on", pitch: 60, velocity: 90 },
      { tick: 80, kind: "off", pitch: 60, velocity: 0 },
      { tick: 80, kind: "on", pitch: 64, velocity: 90 },
      { tick: 160, kind: "off", pitch: 64, velocity: 0 },
    ]);

    const result = analyzeHandDetection(notes);

    expect(result.classification).toBe("singleHand");
    expect(result.classification).not.toBe("dualHand");
  });
});

const note = (noteNumber: number, startMs: number, durationMs: number): HandDetectionNote => ({
  noteNumber,
  startMs,
  durationMs,
  velocity: 90,
  channel: 1,
});

const toNotes = (events: readonly MidiLikeEvent[]): readonly HandDetectionNote[] => {
  const activeByPitch = new Map<number, number[]>();
  const notes: HandDetectionNote[] = [];

  const sorted = [...events].sort((a, b) => {
    if (a.tick !== b.tick) {
      return a.tick - b.tick;
    }
    if (a.kind === b.kind) {
      return a.pitch - b.pitch;
    }
    return a.kind === "off" ? -1 : 1;
  });

  for (const event of sorted) {
    if (event.kind === "on" && event.velocity > 0) {
      const stack = activeByPitch.get(event.pitch) ?? [];
      stack.push(event.tick);
      activeByPitch.set(event.pitch, stack);
      continue;
    }

    const stack = activeByPitch.get(event.pitch);
    if (stack === undefined || stack.length === 0) {
      continue;
    }

    const startTick = stack.shift();
    if (startTick === undefined) {
      continue;
    }

    notes.push(note(event.pitch, startTick, Math.max(1, event.tick - startTick)));
    if (stack.length === 0) {
      activeByPitch.delete(event.pitch);
    } else {
      activeByPitch.set(event.pitch, stack);
    }
  }

  return notes.sort((a, b) => {
    if (a.startMs !== b.startMs) {
      return a.startMs - b.startMs;
    }
    return a.noteNumber - b.noteNumber;
  });
};
