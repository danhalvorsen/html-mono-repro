import type { MidiParsedNoteEvent } from "@monorepo/music-core-midi";
import { LitElement, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import type { PianoWaterfallConfiguration } from "../piano/PianoRootConfiguration";
import {
    DefaultPianoRootConfiguration,
} from "../piano/PianoRootConfiguration";
import { mapTangentNoteToColumn } from "./midi-column-mapper";
import {
    MidiAPIReactiveController,
} from "./midiApi-waterfall-reative-controller";
import "./piano-waterfall-column";
import type { ColumnWc } from "./piano-waterfall-column";
import type { PlayedNoteWc } from "./played-note-wc";

export class PianoWaterfallNew extends LitElement {
  readonly #activeNotes = new Map<string, MidiParsedNoteEvent>();

  public constructor() {
    super();

    new MidiAPIReactiveController(this, {
      onMIDISuccess: () => {},
      onMIDIFailure: (error: Error) => {
        console.error(error);
      },
      onNote: () => {},
      onNoteOn: (event: MidiParsedNoteEvent) => {
        this.handleParsedNoteEvent(event);
      },
      onNoteOff: (event: MidiParsedNoteEvent) => {
        this.handleParsedNoteEvent(event);
      },
    });
  }

  public handleParsedNoteEvent(event: MidiParsedNoteEvent): void {
    if (event.type === "noteon") {
      this.#activeNotes.set(this.noteKey(event), event);
      return;
    }

    const key = this.noteKey(event);
    const startedNote = this.#activeNotes.get(key);

    if (startedNote === undefined) {
      return;
    }

    const holdMs = Math.max(0, event.timestamp - startedNote.timestamp);

    this.addPlayedNote({
      ...event,
      holdMs,
    });

    this.#activeNotes.delete(key);
  }

  @property({ attribute: false })
  public options: PianoWaterfallConfiguration =
    DefaultPianoRootConfiguration.waterfall;

  protected override firstUpdated(): void {
    this.propagateToColumns();
  }

  protected override updated(): void {
    this.applyHostLayout();
    this.propagateToColumns();
  }

  protected override render(): TemplateResult {
    return html`
      ${this.options.columns.map((_, index) => html`
        <slot name=${`column-${index}`} @slotchange=${this.onSlotChange}></slot>
      `)}
    `;
  }

  private readonly onSlotChange = (): void => {
    this.propagateToColumns();
  };

  private propagateToColumns(): void {
    for (let index = 0; index < this.options.columns.length; index += 1) {
      const columnOptions = this.options.columns[index];
      const slot = this.shadowRoot?.querySelector(`slot[name="column-${index}"]`);

      if (columnOptions === undefined || !(slot instanceof HTMLSlotElement)) {
        continue;
      }

      const columns = slot.assignedElements({ flatten: true }).filter(this.isColumn);

      for (const column of columns) {
        column.options = columnOptions;
        column.requestUpdate();
      }
    }
  }

  private applyHostLayout(): void {
    this.style.position = "absolute";
    this.style.left = `${this.options.position.x}px`;
    this.style.top = `${this.options.position.y}px`;
    this.style.width = `${this.options.size.x}px`;
    this.style.height = `${this.options.size.y}px`;
    this.style.display = "block";
  }

  private addPlayedNote(event: {
    readonly columnIndex: number;
    readonly pitchClass?: number;
    readonly holdMs: number;
  }): void {
    const resolvedIndex = this.resolveColumnIndex(event);
    const column = this.getColumn(resolvedIndex);

    if (column === null) {
      return;
    }

    const playedNote = document.createElement("played-note-wc") as PlayedNoteWc;
    const base = column.options.playedNote;
    const durationHeight = (event.holdMs / 1000) * base.speedPxPerSecond;

    playedNote.options = {
      ...base,
      size: {
        x: column.options.size.x,
        y: Math.max(base.size.y, durationHeight),
      },
    };

    column.appendChild(playedNote);
    void playedNote.updateComplete.then(() => {
      playedNote.startFall(column.options.size.y);
    });
  }

  private getColumn(index: number): ColumnWc | null {
    const slot = this.shadowRoot?.querySelector(`slot[name="column-${index}"]`);

    if (!(slot instanceof HTMLSlotElement)) {
      return null;
    }

    const column = slot.assignedElements({ flatten: true }).find(this.isColumn);
    return column ?? null;
  }

  private resolveColumnIndex(event: {
    readonly columnIndex: number;
    readonly pitchClass?: number;
  }): number {
    if (typeof event.pitchClass === "number") {
      const normalizedPitchClass = ((Math.trunc(event.pitchClass) % 12) + 12) % 12;
      const matchedColumn = this.options.columns.find((column) => {
        const mapped = mapTangentNoteToColumn(column.note);
        return mapped === normalizedPitchClass;
      });

      if (matchedColumn !== undefined) {
        return matchedColumn.index;
      }
    }

    return event.columnIndex;
  }

  private noteKey(event: MidiParsedNoteEvent): string {
    return `${event.channel}:${event.midiNote}`;
  }

  private isColumn(element: Element): element is ColumnWc {
    return element.tagName.toLowerCase() === "column-wc";
  }
}

if (!customElements.get("piano-waterfall-new")) {
  customElements.define("piano-waterfall-new", PianoWaterfallNew);
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-waterfall-new": PianoWaterfallNew;
  }
}