import { MidiStringParser, type MidiString, type ParsedStep } from "@monorepo/music-core-midi";
import {
  EnvelopeADSR,
  FilterSettings,
  FilterType,
  WebAudioMidiPlayer,
  type MidiPlaybackOptions,
} from "@monorepo/music-core-midi-playback";

type StepCount = 8 | 16;

type Track = {
  readonly id: number;
  readonly name: string;
  readonly note: number;
  readonly velocity: number;
  readonly channel: number;
  readonly muted: boolean;
  readonly pattern: readonly boolean[];
};

type SequencerState = {
  readonly bpm: number;
  readonly stepCount: StepCount;
  readonly loop: boolean;
  readonly tracks: readonly Track[];
  readonly isPlaying: boolean;
  readonly currentStep: number;
  readonly errorText: string;
};

type CompiledSequence = {
  readonly midiStream: MidiString;
  readonly steps: readonly ParsedStep[];
  readonly slotByTokenIndex: readonly number[];
};

class MidiSequencePlayer {
  private readonly player: WebAudioMidiPlayer;

  public constructor(player: WebAudioMidiPlayer) {
    this.player = player;
  }

  public async play(
    steps: readonly ParsedStep[],
    onTokenChanged: (index: number) => void,
  ): Promise<void> {
    let index = 0;

    while (index < steps.length) {
      const firstStep = steps[index];
      const holdMs = firstStep.holdMs;

      if (firstStep.message === null) {
        onTokenChanged(index);
        await MidiSequencePlayer.delay(holdMs);
        index += 1;
        continue;
      }

      const groupedSteps: Array<{ readonly index: number; readonly step: ParsedStep }> = [
        { index, step: firstStep },
      ];
      let cursor = index + 1;

      while (cursor < steps.length) {
        const candidate = steps[cursor];

        if (candidate.message === null || candidate.holdMs !== holdMs) {
          break;
        }

        groupedSteps.push({ index: cursor, step: candidate });
        cursor += 1;
      }

      for (const grouped of groupedSteps) {
        const step = grouped.step;
        const playbackOptions: MidiPlaybackOptions = {
          noteLengthSeconds: Math.max(0.03, step.holdMs / 1000),
        };

        onTokenChanged(grouped.index);
        this.player.play(step.message!, playbackOptions);
      }

      await MidiSequencePlayer.delay(holdMs);
      index = cursor;
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function createKickTrack(stepCount: StepCount): Track {
  const pattern = createPattern(stepCount, [0, 4, 8, 12]);

  return {
    id: 1,
    name: "Kick",
    note: 36,
    velocity: 122,
    channel: 1,
    muted: false,
    pattern,
  };
}

function createPattern(stepCount: StepCount, activeSteps: readonly number[]): readonly boolean[] {
  return Array.from({ length: stepCount }, (_, index) => activeSteps.includes(index));
}

function normalizePattern(pattern: readonly boolean[], stepCount: StepCount): readonly boolean[] {
  const normalized = Array.from({ length: stepCount }, (_, index) => pattern[index] ?? false);
  return normalized;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  const rounded = Math.round(value);
  return Math.min(max, Math.max(min, rounded));
}

function parsePatternText(value: string, stepCount: StepCount): readonly boolean[] {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");

  return Array.from({ length: stepCount }, (_, index) => {
    const current = normalized[index] ?? ".";
    return current === "x" || current === "1" || current === "*";
  });
}

function patternToText(pattern: readonly boolean[], stepCount: StepCount): string {
  return Array.from({ length: stepCount }, (_, index) => (pattern[index] ? "x" : ".")).join("");
}

function getStepDurationMs(stepCount: StepCount, bpm: number): number {
  const beatsPerBar = 4;
  const beatMs = 60000 / bpm;
  return clampInt((beatMs * beatsPerBar) / stepCount, 30, 2000);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function mountSequencerApp(app: HTMLDivElement): void {
  const parser = new MidiStringParser();
  const player = new WebAudioMidiPlayer({
    envelope: EnvelopeADSR.create(0.001, 0.08, 0.04, 0.1),
    filter: FilterSettings.create(FilterType.LowPass, 210, 1.2),
    filterEnvelope: EnvelopeADSR.create(0.001, 0.05, 0.1, 0.1),
    noteLengthSeconds: 0.11,
    detuneCents: 1,
    filterEnvAmount: 1.2,
    velocityToFilter: 0.2,
    subLevel: 0.46,
    panSpread: 0,
  });

  const sequencePlayer = new MidiSequencePlayer(player);

  const defaultStepCount: StepCount = 16;

  let state: SequencerState = {
    bpm: 122,
    stepCount: defaultStepCount,
    loop: true,
    tracks: [createKickTrack(defaultStepCount)],
    isPlaying: false,
    currentStep: -1,
    errorText: "",
  };

  let nextTrackId = 2;
  let activePlayRunId = 0;

  function findNextChannel(): number {
    const used = new Set(state.tracks.map((track) => track.channel));

    for (let channel = 1; channel <= 16; channel += 1) {
      if (!used.has(channel)) {
        return channel;
      }
    }

    return 16;
  }

  function createTrackName(trackIndex: number): string {
    return `Track ${trackIndex}`;
  }

  function createNewTrack(stepCount: StepCount): Track {
    const id = nextTrackId;
    nextTrackId += 1;

    const defaultNotes = [36, 38, 42, 46, 49, 51, 45, 47];
    const note = defaultNotes[(id - 1) % defaultNotes.length] ?? 36;
    const pattern = createPattern(stepCount, [0]);

    return {
      id,
      name: createTrackName(id),
      note,
      velocity: 112,
      channel: findNextChannel(),
      muted: false,
      pattern,
    };
  }

  function buildMidiStream(): MidiString {
    const holdMs = getStepDurationMs(state.stepCount, state.bpm);
    const tokens: string[] = [];

    for (let slot = 0; slot < state.stepCount; slot += 1) {
      const activeTracks = state.tracks.filter((track) => !track.muted && track.pattern[slot]);

      if (activeTracks.length === 0) {
        tokens.push(`R-h${holdMs}`);
        continue;
      }

      for (const track of activeTracks) {
        tokens.push(`N${track.note}-h${holdMs}-v${track.velocity}-ch${track.channel}`);
      }
    }

    return tokens.join(" ");
  }

  function compileSequence(): CompiledSequence {
    const holdMs = getStepDurationMs(state.stepCount, state.bpm);
    const tokens: string[] = [];
    const slotByTokenIndex: number[] = [];

    for (let slot = 0; slot < state.stepCount; slot += 1) {
      const activeTracks = state.tracks.filter((track) => !track.muted && track.pattern[slot]);

      if (activeTracks.length === 0) {
        tokens.push(`R-h${holdMs}`);
        slotByTokenIndex.push(slot);
        continue;
      }

      for (const track of activeTracks) {
        tokens.push(`N${track.note}-h${holdMs}-v${track.velocity}-ch${track.channel}`);
        slotByTokenIndex.push(slot);
      }
    }

    const midiStream = tokens.join(" ") as MidiString;
    const steps = parser.parse(midiStream);

    return {
      midiStream,
      steps,
      slotByTokenIndex,
    };
  }

  function render(): void {
    const midiStream = buildMidiStream();
    const stepDurationMs = getStepDurationMs(state.stepCount, state.bpm);

    const transportStepsMarkup = Array.from({ length: state.stepCount }, (_, slot) => {
      const isActive = state.currentStep === slot;
      return `<span class="transport-step${isActive ? " active" : ""}">${slot + 1}</span>`;
    }).join("");

    const tracksMarkup = state.tracks
      .map((track) => {
        const patternText = patternToText(track.pattern, state.stepCount);
        const stepButtons = Array.from({ length: state.stepCount }, (_, slot) => {
          const active = track.pattern[slot] === true;
          return `<button type="button" class="slot-button${active ? " on" : ""}" data-action="toggle-step" data-track-id="${track.id}" data-slot="${slot}">${slot + 1}</button>`;
        }).join("");

        return `
          <section class="track-card">
            <div class="track-header">
              <input
                class="text-input track-name"
                type="text"
                value="${escapeHtml(track.name)}"
                data-action="track-name"
                data-track-id="${track.id}"
                aria-label="Track name"
              />
              <label class="field-inline">Note
                <input class="text-input number" type="number" min="0" max="127" value="${track.note}" data-action="track-note" data-track-id="${track.id}" />
              </label>
              <label class="field-inline">Vel
                <input class="text-input number" type="number" min="1" max="127" value="${track.velocity}" data-action="track-velocity" data-track-id="${track.id}" />
              </label>
              <label class="field-inline">Ch
                <input class="text-input number" type="number" min="1" max="16" value="${track.channel}" data-action="track-channel" data-track-id="${track.id}" />
              </label>
              <label class="field-inline mute-toggle">
                <input type="checkbox" ${track.muted ? "checked" : ""} data-action="track-muted" data-track-id="${track.id}" /> Mute
              </label>
              <button type="button" class="secondary" data-action="remove-track" data-track-id="${track.id}" ${state.tracks.length === 1 ? "disabled" : ""}>Remove</button>
            </div>
            <div class="slot-row">${stepButtons}</div>
            <label class="field-block">Pattern string (x = hit, . = rest)
              <input
                class="text-input"
                type="text"
                value="${patternText}"
                data-action="track-pattern"
                data-track-id="${track.id}"
                spellcheck="false"
              />
            </label>
          </section>
        `;
      })
      .join("");

    app.innerHTML = `
      <main class="sequencer-shell">
        <header class="top-bar">
          <div>
            <h1>String MIDI Sequencer</h1>
            <p>Lean starter: kick-first, 8/16 slots, multi-track MIDI stream.</p>
          </div>
          <div class="transport-buttons">
            <button type="button" class="primary" data-action="play" ${state.isPlaying ? "disabled" : ""}>Play</button>
            <button type="button" class="secondary" data-action="stop" ${state.isPlaying ? "" : "disabled"}>Stop</button>
            <button type="button" class="secondary" data-action="add-track">Add Track</button>
          </div>
        </header>

        <section class="controls">
          <label class="field-inline">BPM
            <input class="text-input number" type="number" min="40" max="220" value="${state.bpm}" data-action="bpm" />
          </label>
          <label class="field-inline">Slots
            <select class="text-input" data-action="step-count">
              <option value="8" ${state.stepCount === 8 ? "selected" : ""}>8</option>
              <option value="16" ${state.stepCount === 16 ? "selected" : ""}>16</option>
            </select>
          </label>
          <label class="field-inline loop-toggle">
            <input type="checkbox" ${state.loop ? "checked" : ""} data-action="loop" /> Loop
          </label>
          <div class="readout">Step length: ${stepDurationMs} ms</div>
        </section>

        <section class="transport-strip">${transportStepsMarkup}</section>

        <section class="tracks-list">
          ${tracksMarkup}
        </section>

        <section class="stream-panel">
          <h2>MIDI stream sent to player</h2>
          <textarea readonly rows="6" class="stream-output">${escapeHtml(midiStream)}</textarea>
        </section>

        ${state.errorText.length > 0 ? `<p class="error" role="alert">${escapeHtml(state.errorText)}</p>` : ""}
      </main>
    `;
  }

  function withTrack(trackId: number, updater: (track: Track) => Track): void {
    state = {
      ...state,
      tracks: state.tracks.map((track) => (track.id === trackId ? updater(track) : track)),
    };
  }

  function onControlInput(target: HTMLInputElement | HTMLSelectElement): void {
    const action = target.dataset.action;

    if (!action) {
      return;
    }

    if (action === "bpm" && target instanceof HTMLInputElement) {
      state = {
        ...state,
        bpm: clampInt(Number(target.value), 40, 220),
      };
      render();
      return;
    }

    if (action === "step-count" && target instanceof HTMLSelectElement) {
      const nextStepCount: StepCount = target.value === "8" ? 8 : 16;

      state = {
        ...state,
        stepCount: nextStepCount,
        currentStep: -1,
        tracks: state.tracks.map((track) => ({
          ...track,
          pattern: normalizePattern(track.pattern, nextStepCount),
        })),
      };

      render();
      return;
    }

    if (action === "loop" && target instanceof HTMLInputElement) {
      state = {
        ...state,
        loop: target.checked,
      };
      render();
      return;
    }

    const trackId = Number(target.dataset.trackId);

    if (!Number.isFinite(trackId)) {
      return;
    }

    if (action === "track-name" && target instanceof HTMLInputElement) {
      withTrack(trackId, (track) => ({
        ...track,
        name: target.value.trim().length > 0 ? target.value.trim() : track.name,
      }));
      render();
      return;
    }

    if (action === "track-note" && target instanceof HTMLInputElement) {
      withTrack(trackId, (track) => ({
        ...track,
        note: clampInt(Number(target.value), 0, 127),
      }));
      render();
      return;
    }

    if (action === "track-velocity" && target instanceof HTMLInputElement) {
      withTrack(trackId, (track) => ({
        ...track,
        velocity: clampInt(Number(target.value), 1, 127),
      }));
      render();
      return;
    }

    if (action === "track-channel" && target instanceof HTMLInputElement) {
      withTrack(trackId, (track) => ({
        ...track,
        channel: clampInt(Number(target.value), 1, 16),
      }));
      render();
      return;
    }

    if (action === "track-muted" && target instanceof HTMLInputElement) {
      withTrack(trackId, (track) => ({
        ...track,
        muted: target.checked,
      }));
      render();
      return;
    }

    if (action === "track-pattern" && target instanceof HTMLInputElement) {
      withTrack(trackId, (track) => ({
        ...track,
        pattern: parsePatternText(target.value, state.stepCount),
      }));
      render();
    }
  }

  async function startPlayback(): Promise<void> {
    if (state.isPlaying) {
      return;
    }

    state = {
      ...state,
      isPlaying: true,
      currentStep: -1,
      errorText: "",
    };

    const playRunId = activePlayRunId + 1;
    activePlayRunId = playRunId;

    render();

    try {
      do {
        const compiled = compileSequence();

        await sequencePlayer.play(compiled.steps, (tokenIndex) => {
          if (activePlayRunId !== playRunId) {
            return;
          }

          const slot = compiled.slotByTokenIndex[tokenIndex] ?? -1;

          state = {
            ...state,
            currentStep: slot,
          };
          render();
        });

        if (!state.loop || activePlayRunId !== playRunId) {
          break;
        }
      } while (true);

      if (activePlayRunId === playRunId) {
        state = {
          ...state,
          currentStep: -1,
        };
        render();
      }
    } catch (error) {
      if (activePlayRunId === playRunId) {
        state = {
          ...state,
          errorText: error instanceof Error ? error.message : "Playback failed.",
          currentStep: -1,
        };
        render();
      }
    } finally {
      if (activePlayRunId === playRunId) {
        state = {
          ...state,
          isPlaying: false,
          currentStep: -1,
        };
        render();
      }
    }
  }

  function stopPlayback(): void {
    if (!state.isPlaying) {
      return;
    }

    activePlayRunId += 1;

    state = {
      ...state,
      isPlaying: false,
      currentStep: -1,
    };

    render();
  }

  app.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>("button[data-action]");

    if (button === null) {
      return;
    }

    const action = button.dataset.action;

    if (action === "play") {
      void startPlayback();
      return;
    }

    if (action === "stop") {
      stopPlayback();
      return;
    }

    if (action === "add-track") {
      state = {
        ...state,
        tracks: [...state.tracks, createNewTrack(state.stepCount)],
      };
      render();
      return;
    }

    if (action === "remove-track") {
      const trackId = Number(button.dataset.trackId);

      if (!Number.isFinite(trackId) || state.tracks.length <= 1) {
        return;
      }

      state = {
        ...state,
        tracks: state.tracks.filter((track) => track.id !== trackId),
      };
      render();
      return;
    }

    if (action === "toggle-step") {
      const trackId = Number(button.dataset.trackId);
      const slot = Number(button.dataset.slot);

      if (!Number.isFinite(trackId) || !Number.isFinite(slot)) {
        return;
      }

      withTrack(trackId, (track) => {
        const nextPattern = [...normalizePattern(track.pattern, state.stepCount)];

        if (slot >= 0 && slot < nextPattern.length) {
          nextPattern[slot] = !nextPattern[slot];
        }

        return {
          ...track,
          pattern: nextPattern,
        };
      });

      render();
    }
  });

  app.addEventListener("input", (event) => {
    const target = event.target;

    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      onControlInput(target);
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target;

    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      onControlInput(target);
    }
  });

  render();
}
