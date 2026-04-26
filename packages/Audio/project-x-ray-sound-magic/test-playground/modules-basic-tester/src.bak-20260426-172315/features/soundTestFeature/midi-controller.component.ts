// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/midi-controller.component.ts

import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import {
  createNoteOff,
  MidiStringParser,
  MidiVelocity,
  type MidiMessage,
  type ParsedStep,
} from "@monorepo/music-core-midi";

export const MidiControllerEvents = {
  message: "midi-message",
  started: "midi-song-started",
  stopped: "midi-song-stopped",
  completed: "midi-song-completed",
} as const;

export type MidiMessageStreamEvent = CustomEvent<{
  readonly message: MidiMessage;
  readonly step: ParsedStep;
  readonly stepIndex: number;
}>;

const londonBridgeSequence =
  "G4-h350-v105-ch1 A4-h350-v105-ch1 G4-h350-v105-ch1 F4-h350-v105-ch1 " +
  "E4-h350-v105-ch1 F4-h350-v105-ch1 G4-h700-v105-ch1 " +
  "D4-h350-v105-ch1 E4-h350-v105-ch1 F4-h700-v105-ch1 " +
  "E4-h350-v105-ch1 F4-h350-v105-ch1 G4-h700-v105-ch1 " +
  "G4-h350-v105-ch1 A4-h350-v105-ch1 G4-h350-v105-ch1 F4-h350-v105-ch1 " +
  "E4-h350-v105-ch1 F4-h350-v105-ch1 G4-h700-v105-ch1 " +
  "D4-h700-v105-ch1 G4-h700-v105-ch1 E4-h700-v105-ch1 C4-h900-v105-ch1";

@customElement("midi-controller")
export class MidiControllerComponent extends LitElement {
  private readonly parser = new MidiStringParser({
    holdMs: 350,
    velocity: 105,
    channel: 1,
  });

  private readonly steps: readonly ParsedStep[] =
    this.parser.parse(londonBridgeSequence);

  private readonly scheduledTimerIds = new Set<number>();

  private playbackRunId = 0;

  @state()
  private isPlaying = false;

  @state()
  private currentStepIndex = -1;

  public disconnectedCallback(): void {
    this.stop();
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <section class="midi-controller">
        <h2>MIDI Controller</h2>

        <p>London Bridge Is Falling Down</p>

        <div class="controls">
          <button type="button" @click=${this.togglePlayback}>
            ${this.isPlaying ? "Stop Song" : "Play Song"}
          </button>
        </div>

        <pre>${this.renderStatusText()}</pre>
      </section>
    `;
  }

  private readonly togglePlayback = (): void => {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    this.play();
  };

  private play(): void {
    this.stop();

    this.isPlaying = true;
    this.currentStepIndex = -1;

    const runId = ++this.playbackRunId;
    let offsetMs = 0;

    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.started, {
        bubbles: true,
        composed: true,
      }),
    );

    this.steps.forEach((step, index) => {
      const startTimerId = window.setTimeout(() => {
        this.scheduledTimerIds.delete(startTimerId);

        if (!this.isCurrentRun(runId)) {
          return;
        }

        this.currentStepIndex = index;
        this.emitStepNoteOn(step, index);
      }, offsetMs);

      this.scheduledTimerIds.add(startTimerId);

      const stopTimerId = window.setTimeout(() => {
        this.scheduledTimerIds.delete(stopTimerId);

        if (!this.isCurrentRun(runId)) {
          return;
        }

        this.emitStepNoteOff(step, index);
      }, offsetMs + step.holdMs);

      this.scheduledTimerIds.add(stopTimerId);

      offsetMs += step.holdMs;
    });

    const completedTimerId = window.setTimeout(() => {
      this.scheduledTimerIds.delete(completedTimerId);

      if (!this.isCurrentRun(runId)) {
        return;
      }

      this.isPlaying = false;
      this.currentStepIndex = -1;

      this.dispatchEvent(
        new CustomEvent(MidiControllerEvents.completed, {
          bubbles: true,
          composed: true,
        }),
      );
    }, offsetMs);

    this.scheduledTimerIds.add(completedTimerId);
  }

  private stop(): void {
    this.playbackRunId++;

    for (const timerId of this.scheduledTimerIds) {
      window.clearTimeout(timerId);
    }

    this.scheduledTimerIds.clear();

    this.isPlaying = false;
    this.currentStepIndex = -1;

    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.stopped, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitStepNoteOn(step: ParsedStep, stepIndex: number): void {
    if (step.message === null) {
      return;
    }

    this.emitMidiMessage(step.message, step, stepIndex);
  }

  private emitStepNoteOff(step: ParsedStep, stepIndex: number): void {
    if (step.message === null) {
      return;
    }

    this.emitMidiMessage(
      createNoteOff(step.message.channel, step.message.note, MidiVelocity.Zero),
      step,
      stepIndex,
    );
  }

  private emitMidiMessage(
    message: MidiMessage,
    step: ParsedStep,
    stepIndex: number,
  ): void {
    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.message, {
        detail: {
          message,
          step,
          stepIndex,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private isCurrentRun(runId: number): boolean {
    return this.isPlaying && this.playbackRunId === runId;
  }

  private renderStatusText(): string {
    if (!this.isPlaying) {
      return "Stopped";
    }

    const step = this.steps[this.currentStepIndex];

    if (step === undefined) {
      return "Starting...";
    }

    return `Playing step ${this.currentStepIndex + 1}/${this.steps.length}: ${step.token}`;
  }

  public static override readonly styles = css`
    :host {
      display: block;
      margin-top: 16px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .midi-controller {
      display: grid;
      gap: 8px;
    }

    h2,
    p {
      margin: 0;
    }

    button {
      padding: 8px 12px;
      font-size: 14px;
      cursor: pointer;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-size: 12px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "midi-controller": MidiControllerComponent;
  }
}