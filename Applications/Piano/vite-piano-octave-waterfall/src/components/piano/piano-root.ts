import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators.js";
import {
  createNoteOff,
  createNoteOn,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";
import {
  RealInstrumentPresets,
  WebAudioMidiPlayer,
} from "@monorepo/music-core-midi-playback";

import {
  PianoNoteEventName,
  TangentInputEventName,
  type PianoRootTangentEventDetail,
  type PianoRootTangentEventKind,
  type TangentInputEventDetail,
} from "./PianoRootEventContracts";
import {
  DefaultPianoRootConfiguration,
  type PianoRootConfiguration,
} from "./PianoRootConfiguration";
import type { PianoOctave } from "../octave/piano-octave";
import type { PianoWaterfallNew } from "../waterfall/piano-waterfall-new";
@customElement("piano-root-new")
export class PianoRoot extends LitElement {
  private static readonly MIDI_TRANSPOSE_SEMITONES = 48;

  private midiPlayer: WebAudioMidiPlayer | null = null;

  @property({ attribute: false })
  public options: PianoRootConfiguration = DefaultPianoRootConfiguration;

  @queryAssignedElements({ flatten: true })
  private readonly assignedElements!: Element[];

  public override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener(
      TangentInputEventName.Pressed,
      this.onTangentPressed as EventListener,
    );

    this.addEventListener(
      TangentInputEventName.Released,
      this.onTangentReleased as EventListener,
    );
  }

  public override disconnectedCallback(): void {
    this.removeEventListener(
      TangentInputEventName.Pressed,
      this.onTangentPressed as EventListener,
    );

    this.removeEventListener(
      TangentInputEventName.Released,
      this.onTangentReleased as EventListener,
    );

    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.propagateToChildren();
  }

  protected override updated(): void {
    this.applyHostLayout();
    this.propagateToChildren();
  }

  protected override render(): TemplateResult {
    return html`<slot @slotchange=${this.onSlotChange}></slot>`;
  }

  private readonly onSlotChange = (): void => {
    this.propagateToChildren();
  };

  private readonly onTangentPressed = (event: Event): void => {
    this.dispatchPianoRootTangentEvent(
      event,
      PianoNoteEventName.NoteOn,
      "pressed",
    );

    this.sendNoteOn(event);
  };

  private readonly onTangentReleased = (event: Event): void => {
    this.dispatchPianoRootTangentEvent(
      event,
      PianoNoteEventName.NoteOff,
      "released",
    );

    this.sendNoteOff(event);
  };

  private sendNoteOn(event: Event): void {
    const detail = this.readTangentInputDetail(event);
    const midiNote = detail?.tangent.midiNote;

    console.log("PianoRootNew:sendNoteOn", {
      midiNote,
      note: detail?.tangent.note,
    });

    if (midiNote === null || midiNote === undefined) {
      return;
    }

    const player = this.getMidiPlayer();
    if (player === null) {
      return;
    }

    const message = createNoteOn(
      MidiChannel.create(1),
      MidiNote.create(midiNote),
      MidiVelocity.create(100),
    );

    player.play(message, {
      noteLengthSeconds: 0.01,
      sustain: 0.2,
    });
  }

  private sendNoteOff(event: Event): void {
    const detail = this.readTangentInputDetail(event);
    const midiNote = detail?.tangent.midiNote;

    console.log("PianoRootNew:sendNoteOff", {
      midiNote,
      note: detail?.tangent.note,
    });

    if (midiNote === null || midiNote === undefined) {
      return;
    }

    const player = this.getMidiPlayer();
    if (player === null) {
      return;
    }

    const message = createNoteOff(
      MidiChannel.create(1),
      MidiNote.create(midiNote),
      MidiVelocity.Zero,
    );

    player.play(message, {
      noteLengthSeconds: 0.04,
      sustain: 0.2,
    });
  }

  private readTangentInputDetail(event: Event): TangentInputEventDetail | null {
    const detail = (event as CustomEvent<TangentInputEventDetail>).detail;

    if (detail?.tangent === undefined) {
      return null;
    }

    return detail;
  }

  private getMidiPlayer(): WebAudioMidiPlayer | null {
    if (this.midiPlayer !== null) {
      return this.midiPlayer;
    }

    try {
      console.log("PianoRootNew:create-midi-player");

      this.midiPlayer = new WebAudioMidiPlayer({
        ...RealInstrumentPresets.synthPluck,
      });

      return this.midiPlayer;
    } catch {
      return null;
    }
  }

  private dispatchPianoRootTangentEvent(
    event: Event,
    eventName: string,
    kind: PianoRootTangentEventKind,
  ): void {
    const detail = this.readTangentInputDetail(event);

    if (detail === null) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<PianoRootTangentEventDetail>(eventName, {
        bubbles: true,
        composed: true,
        detail: {
          kind,
          pointerId: detail.pointerId,
          tangent: detail.tangent,
        },
      }),
    );
  }

  private propagateToChildren(): void {
    for (const child of this.assignedElements) {
      if (this.isWaterfall(child)) {
        child.options = this.options.waterfall;
        child.requestUpdate();
        continue;
      }

      if (this.isPianoOctave(child)) {
        const octave = this.options.octaves.find((item) => item.id === child.id);
        child.options = octave ?? this.options.octaves[0] ?? child.options;
        child.requestUpdate();
      }
    }
  }

  private applyHostLayout(): void {
    this.style.position = "absolute";
    this.style.left = `${this.options.root.position.x}px`;
    this.style.top = `${this.options.root.position.y}px`;
    this.style.width = `${this.options.root.size.x}px`;
    this.style.height = `${this.options.root.size.y}px`;
    this.style.display = "block";
  }

  private isWaterfall(element: Element): element is PianoWaterfallNew {
    return element.tagName.toLowerCase() === "piano-waterfall-new";
  }

  private isPianoOctave(element: Element): element is PianoOctave {
    return element.tagName.toLowerCase() === "piano-octave";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-root-new": PianoRoot;
  }
}
