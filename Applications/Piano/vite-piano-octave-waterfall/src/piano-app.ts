import type { MidiParsedNoteEvent } from "@monorepo/music-core-midi";
import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import {
  PianoNoteEventName,
  type PianoRootTangentEventDetail,
} from "./components/piano/PianoRootEventContracts";
import {
  mapMidiNoteToColumn,
  mapTangentNoteToColumn,
} from "./components/waterfall/midi-column-mapper";

import "./components/octave/piano-octave";
import "./components/piano/piano-root";
import "./components/tangents/tangent-wc";
import "./components/waterfall/piano-waterfall-column";
import "./components/waterfall/piano-waterfall-new";
import "./components/waterfall/played-note-wc";

import {
  DefaultPianoRootConfiguration,
  type PianoRootConfiguration,
} from "./components/piano/PianoRootConfiguration";
import {
  PianoRootConfigurationScaler,
  type Scale2,
} from "./components/piano/PianoRootConfigurationScaler";

@customElement("piano-app")
export class PianoApp extends LitElement {
  private readonly sourceOptions: PianoRootConfiguration =
    DefaultPianoRootConfiguration;

  private readonly scaler = new PianoRootConfigurationScaler();

  @property({ attribute: false })
  public scale: Scale2 = { x: 1, y: 1 };

  @query("piano-waterfall-new")
  private readonly waterfallElement?: HTMLElement & {
    handleParsedNoteEvent(event: MidiParsedNoteEvent): void;
  };

  public override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener(PianoNoteEventName.NoteOn, this.onPianoNoteOn as EventListener);
    this.addEventListener(PianoNoteEventName.NoteOff, this.onPianoNoteOff as EventListener);
  }

  public override disconnectedCallback(): void {
    this.removeEventListener(PianoNoteEventName.NoteOn, this.onPianoNoteOn as EventListener);
    this.removeEventListener(PianoNoteEventName.NoteOff, this.onPianoNoteOff as EventListener);

    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    const options = this.scaler.scale(this.sourceOptions, this.scale);

    return html`
      <piano-root-new .options=${options}>
        <piano-waterfall-new .options=${options.waterfall}>
          ${options.waterfall.columns.map(
            (column, index) => html`
              <column-wc slot=${`column-${index}`} .options=${column}>
                <played-note-wc .options=${column.playedNote}></played-note-wc>
              </column-wc>
            `
          )}
        </piano-waterfall-new>

        ${options.octaves.map(
          (octave) => html`
            <piano-octave id=${octave.id} .options=${octave}></piano-octave>
          `
        )}
      </piano-root-new>
    `;
  }

  private readonly onPianoNoteOn = (event: Event): void => {
    this.forwardPianoEventAsParsedNote(event, "noteon");
  };

  private readonly onPianoNoteOff = (event: Event): void => {
    this.forwardPianoEventAsParsedNote(event, "noteoff");
  };

  private forwardPianoEventAsParsedNote(
    event: Event,
    type: "noteon" | "noteoff",
  ): void {
    const detail = (event as CustomEvent<PianoRootTangentEventDetail>).detail;
    const midiNote = detail?.tangent?.midiNote;
    const note = detail?.tangent?.note;

    if (typeof midiNote !== "number") {
      return;
    }

    const velocity = type === "noteon" ? 100 : 0;
    const status = type === "noteon" ? 0x90 : 0x80;
    const mappedByName = typeof note === "string" ? mapTangentNoteToColumn(note) : null;
    const pitchClass = mappedByName ?? mapMidiNoteToColumn(midiNote);
    const parsed: MidiParsedNoteEvent = {
      type,
      status,
      data: [status, midiNote, velocity],
      timestamp: performance.now(),
      channel: 0,
      midiNote,
      velocity,
      pitchClass,
      octave: Math.floor(midiNote / 12) - 1,
      columnIndex: pitchClass,
    };

    this.waterfallElement?.handleParsedNoteEvent(parsed);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-app": PianoApp;
  }
}
