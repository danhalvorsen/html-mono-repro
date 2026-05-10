export type HandClassification = "singleHand" | "dualHand" | "ambiguous";

export type HandLabel = "LH" | "RH";

export type HandDetectionReason =
  | "insufficientEvidence"
  | "thresholdGate"
  | "overlapWideInterval"
  | "overlapClosePosition"
  | "singleLineContinuity"
  | "spanExceeded"
  | "windowDualEvidence"
  | "globalDualEvidence";

export interface HandDetectionNote {
  readonly noteNumber: number;
  readonly startMs: number;
  readonly durationMs: number;
  readonly keyUpMs?: number;
  readonly sustainedOnly?: boolean;
  readonly velocity: number;
  readonly channel: number;
}

export interface HandDetectionWindow {
  readonly startMs: number;
  readonly endMs: number;
  readonly classification: HandClassification;
  readonly confidence: number;
  readonly reasons: readonly HandDetectionReason[];
  readonly handCenters?: HandCenterState;
}

export interface HandDetectionConfig {
  readonly overlapPitchDistanceForDualHand: number;
  readonly minWideOverlapPairsPerWindow: number;
  readonly minWideOverlapPairsGlobalForDual: number;
  readonly lowRegisterBoundary: number;
  readonly highRegisterBoundary: number;
  readonly windowMs: number;
  readonly minimumDualWindowsForOverallDual: number;
  readonly maxSingleHandSpan: number;
  readonly minNoteCountForDual: number;
  readonly minCoverageMsForDual: number;
  readonly minConfidenceForDual: number;
  readonly ambiguityBand: number;
  readonly handCenterSmoothing: number;
}

export interface HandDetectionEvidence {
  readonly noteCount: number;
  readonly coverageMs: number;
  readonly wideOverlapPairs: number;
  readonly closeOverlapPairs: number;
  readonly spanExceededPairs: number;
  readonly continuityPenaltyCount: number;
  readonly dualWindowCount: number;
}

export interface HandDetectionResult {
  readonly classification: HandClassification;
  readonly confidence: number;
  readonly windows: readonly HandDetectionWindow[];
  readonly reasons: readonly HandDetectionReason[];
  readonly evidence: HandDetectionEvidence;
  readonly handCenterState?: HandCenterState;
}

export interface HandCenterState {
  readonly left: number;
  readonly right: number;
}

interface HandDetectionFeatureSnapshot {
  readonly lowCount: number;
  readonly highCount: number;
  readonly hasExplicitPhysicalHints: boolean;
  readonly registerSpread: number;
  readonly globalWideOverlapPairs: number;
  readonly closeOverlapPairs: number;
  readonly spanExceededPairs: number;
  readonly continuityPenaltyCount: number;
  readonly noteCount: number;
  readonly coverageMs: number;
}

export interface HandDetectionWindowInput {
  readonly startMs: number;
  readonly endMs: number;
  readonly notes: readonly HandDetectionNote[];
}

export interface HandDetectionWindowPolicy {
  segment(notes: readonly HandDetectionNote[], config: HandDetectionConfig): readonly HandDetectionWindowInput[];
}

class FixedDurationWindowPolicy implements HandDetectionWindowPolicy {
  public segment(
    notes: readonly HandDetectionNote[],
    config: HandDetectionConfig,
  ): readonly HandDetectionWindowInput[] {
    const firstStart = notes[0]!.startMs;
    const lastEnd = notes[notes.length - 1]!.startMs + notes[notes.length - 1]!.durationMs;
    const windows: HandDetectionWindowInput[] = [];

    for (let start = firstStart; start < lastEnd; start += config.windowMs) {
      const end = start + config.windowMs;
      const windowNotes = notes.filter((note) => note.startMs >= start && note.startMs < end);
      windows.push({
        startMs: start,
        endMs: end,
        notes: windowNotes,
      });
    }

    return windows;
  }
}

class HandCenterTracker {
  private state?: HandCenterState;

  public constructor(private readonly smoothing: number) {}

  public update(notes: readonly HandDetectionNote[]): HandCenterState | undefined {
    if (notes.length < 2) {
      return this.state;
    }

    const sortedByPitch = [...notes].sort((a, b) => a.noteNumber - b.noteNumber);
    const split = Math.floor(sortedByPitch.length / 2);
    const leftNotes = sortedByPitch.slice(0, Math.max(1, split));
    const rightNotes = sortedByPitch.slice(Math.max(1, split));

    const rawLeft = averagePitch(leftNotes);
    const rawRight = averagePitch(rightNotes);
    const normalizedRaw =
      rawLeft <= rawRight
        ? { left: rawLeft, right: rawRight }
        : { left: rawRight, right: rawLeft };

    if (this.state === undefined) {
      this.state = normalizedRaw;
      return this.state;
    }

    const keep = Math.max(0, Math.min(1, this.smoothing));
    const take = 1 - keep;
    const smoothed: HandCenterState = {
      left: this.state.left * keep + normalizedRaw.left * take,
      right: this.state.right * keep + normalizedRaw.right * take,
    };
    this.state = smoothed;
    return this.state;
  }

  public snapshot(): HandCenterState | undefined {
    return this.state;
  }
}

const defaultConfig: HandDetectionConfig = {
  overlapPitchDistanceForDualHand: 8,
  minWideOverlapPairsPerWindow: 2,
  minWideOverlapPairsGlobalForDual: 2,
  lowRegisterBoundary: 58,
  highRegisterBoundary: 66,
  windowMs: 1000,
  minimumDualWindowsForOverallDual: 1,
  maxSingleHandSpan: 12,
  minNoteCountForDual: 4,
  minCoverageMsForDual: 700,
  minConfidenceForDual: 0.6,
  ambiguityBand: 0.15,
  handCenterSmoothing: 0.7,
};

export const analyzeHandDetection = (
  notes: readonly HandDetectionNote[],
  config: Partial<HandDetectionConfig> = {},
  windowPolicy: HandDetectionWindowPolicy = new FixedDurationWindowPolicy(),
): HandDetectionResult => {
  if (notes.length === 0) {
    return {
      classification: "ambiguous",
      confidence: 0,
      windows: [],
      reasons: ["insufficientEvidence"],
      evidence: {
        noteCount: 0,
        coverageMs: 0,
        wideOverlapPairs: 0,
        closeOverlapPairs: 0,
        spanExceededPairs: 0,
        continuityPenaltyCount: 0,
        dualWindowCount: 0,
      },
    };
  }

  const resolved: HandDetectionConfig = {
    ...defaultConfig,
    ...config,
  };

  const sorted = [...notes].sort((a, b) => {
    if (a.startMs !== b.startMs) {
      return a.startMs - b.startMs;
    }
    return a.noteNumber - b.noteNumber;
  });

  const features = collectFeatureSnapshot(sorted, resolved);
  const windowInputs = windowPolicy.segment(sorted, resolved);
  const windows = windowInputs.map((window) => classifyWindow(window, resolved));
  const dualWindowCount = windows.filter((window) => window.classification === "dualHand").length;

  const hasBimodalRegister = features.lowCount >= 1 && features.highCount >= 1;
  const hasWindowDualEvidence = dualWindowCount >= resolved.minimumDualWindowsForOverallDual;
  const hasGlobalDualEvidence =
    features.globalWideOverlapPairs >= resolved.minWideOverlapPairsGlobalForDual;
  const hasWideRegisterSpread = features.registerSpread >= 12;
  const hasDualHints = hasWindowDualEvidence || hasGlobalDualEvidence || (hasBimodalRegister && hasWideRegisterSpread);
  const passesThresholdGate =
    features.noteCount >= resolved.minNoteCountForDual && features.coverageMs >= resolved.minCoverageMsForDual;

  const dualScore = scoreDualEvidence({
    hasWindowDualEvidence,
    hasGlobalDualEvidence,
    spanExceededPairs: features.spanExceededPairs,
    bimodal: hasBimodalRegister,
  });
  const singleScore = scoreSingleEvidence({
    closeOverlapPairs: features.closeOverlapPairs,
    continuityPenaltyCount: features.continuityPenaltyCount,
    bimodal: hasBimodalRegister,
  });
  const confidence = computeConfidence(dualScore, singleScore);

  let classification: HandClassification;
  const reasons: HandDetectionReason[] = [];

  const dualCandidate =
    hasBimodalRegister &&
    (hasWindowDualEvidence || hasGlobalDualEvidence) &&
    passesThresholdGate &&
    confidence >= resolved.minConfidenceForDual;

  const sparseWideRegisterAmbiguous =
    !passesThresholdGate &&
    hasWideRegisterSpread &&
    features.noteCount <= 3 &&
    !features.hasExplicitPhysicalHints;

  const overlapDrivenDualHints = hasWindowDualEvidence || hasGlobalDualEvidence;
  const thresholdAmbiguous =
    !passesThresholdGate &&
    (overlapDrivenDualHints || sparseWideRegisterAmbiguous) &&
    hasWideRegisterSpread;

  const borderlineAmbiguous =
    Math.abs(dualScore - singleScore) <= resolved.ambiguityBand && hasBimodalRegister;

  if (dualCandidate) {
    classification = "dualHand";
    reasons.push(hasWindowDualEvidence ? "windowDualEvidence" : "globalDualEvidence");
    if (features.spanExceededPairs > 0) {
      reasons.push("spanExceeded");
    }
    reasons.push("overlapWideInterval");
  } else if (thresholdAmbiguous || borderlineAmbiguous) {
    classification = "ambiguous";
    reasons.push(!passesThresholdGate ? "thresholdGate" : "insufficientEvidence");
  } else {
    classification = "singleHand";
    reasons.push("singleLineContinuity");
    if (features.closeOverlapPairs > 0) {
      reasons.push("overlapClosePosition");
    }
  }

  const windowsWithCenters = attachHandCenters(
    windows,
    windowInputs,
    resolved,
    classification === "ambiguous",
  );

  const handCenterState =
    classification === "ambiguous" ? undefined : lastDefinedHandCenter(windowsWithCenters);

  return {
    classification,
    confidence,
    windows: mergeAdjacentCompatibleWindows(windowsWithCenters),
    reasons,
    evidence: {
      noteCount: features.noteCount,
      coverageMs: features.coverageMs,
      wideOverlapPairs: features.globalWideOverlapPairs,
      closeOverlapPairs: features.closeOverlapPairs,
      spanExceededPairs: features.spanExceededPairs,
      continuityPenaltyCount: features.continuityPenaltyCount,
      dualWindowCount,
    },
    ...(handCenterState !== undefined ? { handCenterState } : {}),
  };
};

const collectFeatureSnapshot = (
  notes: readonly HandDetectionNote[],
  config: HandDetectionConfig,
): HandDetectionFeatureSnapshot => {
  const lowCount = notes.filter((note) => note.noteNumber < config.lowRegisterBoundary).length;
  const highCount = notes.filter((note) => note.noteNumber > config.highRegisterBoundary).length;
  const hasExplicitPhysicalHints = notes.some(
    (note) => note.keyUpMs !== undefined || note.sustainedOnly !== undefined,
  );
  const minNote = notes.reduce((min, note) => Math.min(min, note.noteNumber), notes[0]!.noteNumber);
  const maxNote = notes.reduce((max, note) => Math.max(max, note.noteNumber), notes[0]!.noteNumber);
  const registerSpread = maxNote - minNote;

  return {
    lowCount,
    highCount,
    hasExplicitPhysicalHints,
    registerSpread,
    globalWideOverlapPairs: countWideOverlaps(notes, config.overlapPitchDistanceForDualHand),
    closeOverlapPairs: countCloseOverlaps(notes, config.maxSingleHandSpan),
    spanExceededPairs: countSpanExceededSeverity(notes, config.maxSingleHandSpan),
    continuityPenaltyCount: countContinuityPenalties(notes),
    noteCount: notes.length,
    coverageMs: physicalEndMs(notes[notes.length - 1]!) - notes[0]!.startMs,
  };
};

const classifyWindow = (
  window: HandDetectionWindowInput,
  config: HandDetectionConfig,
): HandDetectionWindow => {
  const overlapPairCount = countWideOverlaps(window.notes, config.overlapPitchDistanceForDualHand);
  const lowCount = window.notes.filter((note) => note.noteNumber < config.lowRegisterBoundary).length;
  const highCount = window.notes.filter((note) => note.noteNumber > config.highRegisterBoundary).length;

  const dualHand =
    overlapPairCount >= config.minWideOverlapPairsPerWindow &&
    lowCount >= 1 &&
    highCount >= 1;
  const classification: HandClassification = dualHand ? "dualHand" : "singleHand";

  return {
    startMs: window.startMs,
    endMs: window.endMs,
    classification,
    confidence: dualHand ? 0.8 : 0.75,
    reasons: dualHand ? ["windowDualEvidence", "overlapWideInterval"] : ["singleLineContinuity"],
  };
};

const mergeAdjacentCompatibleWindows = (
  windows: readonly HandDetectionWindow[],
): readonly HandDetectionWindow[] => {
  if (windows.length === 0) {
    return [];
  }

  const merged: HandDetectionWindow[] = [];
  let current = { ...windows[0]! };

  for (let i = 1; i < windows.length; i++) {
    const next = windows[i]!;
    if (next.classification === current.classification && next.startMs === current.endMs) {
      const mergedCenter = next.handCenters ?? current.handCenters;
      current = {
        ...current,
        endMs: next.endMs,
        confidence: Math.max(current.confidence, next.confidence),
        ...(mergedCenter !== undefined ? { handCenters: mergedCenter } : {}),
      };
      continue;
    }

    merged.push(current);
    current = { ...next };
  }

  merged.push(current);
  return merged;
};

const attachHandCenters = (
  windows: readonly HandDetectionWindow[],
  windowInputs: readonly HandDetectionWindowInput[],
  config: HandDetectionConfig,
  suppress: boolean,
): readonly HandDetectionWindow[] => {
  if (suppress) {
    return windows.map((window) => ({ ...window }));
  }

  const tracker = new HandCenterTracker(config.handCenterSmoothing);
  return windows.map((window, index) => {
    const notes = windowInputs[index]?.notes ?? [];
    const centers = tracker.update(notes);
    return {
      ...window,
      ...(centers !== undefined ? { handCenters: centers } : {}),
    };
  });
};

const lastDefinedHandCenter = (
  windows: readonly HandDetectionWindow[],
): HandCenterState | undefined => {
  for (let i = windows.length - 1; i >= 0; i--) {
    const centers = windows[i]?.handCenters;
    if (centers !== undefined) {
      return centers;
    }
  }
  return undefined;
};

const averagePitch = (notes: readonly HandDetectionNote[]): number => {
  if (notes.length === 0) {
    return 0;
  }
  const sum = notes.reduce((acc, note) => acc + note.noteNumber, 0);
  return sum / notes.length;
};

const countWideOverlaps = (notes: readonly HandDetectionNote[], minDistance: number): number => {
  let count = 0;

  for (let i = 0; i < notes.length; i++) {
    const left = notes[i]!;
    const leftEnd = physicalEndMs(left);
    for (let j = i + 1; j < notes.length; j++) {
      const right = notes[j]!;
      if (left.sustainedOnly === true || right.sustainedOnly === true) {
        continue;
      }
      if (right.startMs >= leftEnd) {
        break;
      }
      const rightEnd = physicalEndMs(right);
      const overlaps = left.startMs < rightEnd && right.startMs < leftEnd;
      if (!overlaps) {
        continue;
      }
      if (Math.abs(left.noteNumber - right.noteNumber) >= minDistance) {
        count += 1;
      }
    }
  }

  return count;
};

const countCloseOverlaps = (notes: readonly HandDetectionNote[], maxDistance: number): number => {
  let count = 0;

  for (let i = 0; i < notes.length; i++) {
    const left = notes[i]!;
    const leftEnd = physicalEndMs(left);
    for (let j = i + 1; j < notes.length; j++) {
      const right = notes[j]!;
      if (left.sustainedOnly === true || right.sustainedOnly === true) {
        continue;
      }
      if (right.startMs >= leftEnd) {
        break;
      }
      const rightEnd = physicalEndMs(right);
      const overlaps = left.startMs < rightEnd && right.startMs < leftEnd;
      if (!overlaps) {
        continue;
      }
      if (Math.abs(left.noteNumber - right.noteNumber) <= maxDistance) {
        count += 1;
      }
    }
  }

  return count;
};

const countContinuityPenalties = (notes: readonly HandDetectionNote[]): number => {
  if (notes.length < 3) {
    return 0;
  }
  let penalties = 0;
  for (let i = 1; i < notes.length; i++) {
    const prev = notes[i - 1]!;
    const current = notes[i]!;
    if (current.startMs > prev.startMs + prev.durationMs + 250) {
      penalties += 1;
    }
    if (Math.abs(current.noteNumber - prev.noteNumber) > 11) {
      penalties += 1;
    }
  }
  return penalties;
};

const scoreDualEvidence = (input: {
  hasWindowDualEvidence: boolean;
  hasGlobalDualEvidence: boolean;
  spanExceededPairs: number;
  bimodal: boolean;
}): number => {
  let score = 0;
  if (input.hasWindowDualEvidence) {
    score += 1.1;
  }
  if (input.hasGlobalDualEvidence) {
    score += 1.0;
  }
  if (input.spanExceededPairs > 0) {
    score += 0.8;
  }
  if (input.bimodal) {
    score += 0.6;
  }
  return score;
};

const scoreSingleEvidence = (input: {
  closeOverlapPairs: number;
  continuityPenaltyCount: number;
  bimodal: boolean;
}): number => {
  let score = 0.6;
  if (input.closeOverlapPairs > 0) {
    score += 0.8;
  }
  if (input.continuityPenaltyCount <= 1) {
    score += 0.8;
  }
  if (!input.bimodal) {
    score += 0.7;
  }
  return score;
};

const computeConfidence = (primary: number, secondary: number): number => {
  const max = Math.max(primary, secondary, 0.0001);
  const min = Math.min(primary, secondary, 0.0001);
  const ratio = min / max;
  return Math.max(0, Math.min(0.9, 1 - ratio));
};

const physicalEndMs = (note: HandDetectionNote): number => {
  if (note.keyUpMs !== undefined) {
    return note.keyUpMs;
  }
  return note.startMs + note.durationMs;
};

const countSpanExceededSeverity = (notes: readonly HandDetectionNote[], maxSpan: number): number => {
  let severity = 0;

  for (let i = 0; i < notes.length; i++) {
    const left = notes[i]!;
    const leftEnd = physicalEndMs(left);
    for (let j = i + 1; j < notes.length; j++) {
      const right = notes[j]!;
      if (left.sustainedOnly === true || right.sustainedOnly === true) {
        continue;
      }
      if (right.startMs >= leftEnd) {
        break;
      }
      const rightEnd = physicalEndMs(right);
      const overlaps = left.startMs < rightEnd && right.startMs < leftEnd;
      if (!overlaps) {
        continue;
      }
      const exceed = Math.abs(left.noteNumber - right.noteNumber) - maxSpan;
      if (exceed > 0) {
        severity += exceed;
      }
    }
  }

  return severity;
};
