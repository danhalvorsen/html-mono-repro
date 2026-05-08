import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MidiChannel, MidiNote, MidiVelocity, createNoteOn } from "@monorepo/music-core-midi";
import { EnvelopeADSR, JumpPreset, WebAudioMidiPlayer } from "@monorepo/music-core-midi-playback";
import {
  PianoEventName,
  type TangentHoldEndDetail,
  type TangentHoldStartDetail
} from "../application/PianoEventContracts";
import { DefaultMidiNoteMapper } from "../application/DefaultMidiNoteMapper";
import { Accords, type AccordStep } from "../music/Accords";
import {
  DEFAULT_OCTAVE_GEOMETRY,
  type LegacyTangentGeometry
} from "../octave/geometry/DefaultOctaveGeometry";
import { Tangent } from "./tangent";
import "./tangent";

import { DefaultPianoTangentNamingPolicy } from "../application/PianoTangentNamingPolicy";
type TangentTemplate = "none" | "identifier" | "debug";

type HeldVoice = {
  readonly holdId: string;
  readonly note: string;
    midiNote: number;
  readonly osc: OscillatorNode;
  readonly gain: GainNode;
  readonly polygon: SVGPolygonElement;
  readonly startedAtMs: number;
};

type TangentBounds = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
};

type TangentLayoutItem = {
  readonly geometry: LegacyTangentGeometry;
  readonly isBlack: boolean;
  readonly leftPercent: number;
  readonly topPercent: number;
  readonly widthPercent: number;
  readonly heightPercent: number;
  readonly zIndex: number;
};

@customElement("piano-octave")
export class PianoOctave extends LitElement {
  private readonly tangentNamePolicy = new DefaultPianoTangentNamingPolicy();

  public static override styles = css`
    :host {
      display: block;
    }

    .octave-stage {
      display: block;
      overflow: visible;
      box-sizing: border-box;
      touch-action: none;
    }

    .tangent-layer {
      position: absolute;
      inset: 0;
      overflow: visible;
    }

    piano-tangent {
      position: absolute;
      display: block;
      box-sizing: border-box;
    }
  `;

  @property({ type: String })
  public width = "100%";

  @property({ type: String })
  public height = "auto";

  @property({ type: String })
  public position: "static" | "relative" | "absolute" | "fixed" | "sticky" = "relative";

  @property({ type: String, attribute: "top" })
  public top = "auto";

  @property({ type: String, attribute: "left" })
  public left = "auto";

  @property({ type: Number })
  public gap = 4;

  @property({ type: Number, attribute: "octave-index" })
  public octaveIndex = 0;

  @property({ type: Number, attribute: "label-max-width-ratio" })
  public labelMaxWidthRatio = 0.8;

  @property({ type: Boolean, attribute: "show-box" })
  public showBox = true;

  @property({ type: Number, attribute: "box-width-ratio" })
  public boxWidthRatio = 0.8;

  @property({ type: Number, attribute: "box-depth-ratio" })
  public boxDepthRatio = 0.9;

  @property({ type: String, attribute: "template" })
  public template: TangentTemplate = "identifier";

  private readonly midiPlayer = new WebAudioMidiPlayer({
    ...JumpPreset,
    envelope: EnvelopeADSR.create(
      JumpPreset.envelope.attack,
      JumpPreset.envelope.decay,
      JumpPreset.envelope.sustain,
      0.45
    )
  });

  private readonly midiChannel = MidiChannel.create(1);
  private readonly midiVelocity = MidiVelocity.create(110);
  private readonly midiNoteMapper = new DefaultMidiNoteMapper();
  private readonly holdAudioContext = new AudioContext();
  private readonly activeVoicesByPointer = new Map<number, HeldVoice>();
  private syntheticHoldSequence = 0;

  private readonly onOctavePointerDown = (event: Event): void => {
    const pointerEvent = event as PointerEvent;
    const polygon = event
      .composedPath()
      .find((node): node is SVGPolygonElement => node instanceof SVGPolygonElement);

    if (polygon === undefined) {
      return;
    }

    const note = polygon.dataset.note;
    if (note === undefined || note.length === 0) {
      return;
    }

    const holdId = `${this.octaveIndex}:${note}:${pointerEvent.pointerId}:${performance.now()}`;

    this.setPressedVisual(polygon, true);
    this.startHeldNote(pointerEvent.pointerId, note, polygon, holdId);

    this.dispatchEvent(
      new CustomEvent<TangentHoldStartDetail>(PianoEventName.TangentHoldStart, {
        detail: {
          holdId,
          note,
          octaveIndex: this.octaveIndex,
          octave: this.createOctaveEventDetail(),
          midiNote: midiNote
        },
        bubbles: true,
        composed: true
      })
    );

    this.dispatchEvent(
      new CustomEvent(PianoEventName.TangentClick, {
        detail: { tangentId: note, note },
        bubbles: true,
        composed: true
      })
    );
  };

  private readonly onOctavePointerUp = (event: Event): void => {
    const pointerEvent = event as PointerEvent;
    this.stopHeldNote(pointerEvent.pointerId);
  };

  protected override firstUpdated(): void {
    this.renderRoot.addEventListener("pointerdown", this.onOctavePointerDown);
    this.renderRoot.addEventListener("pointerup", this.onOctavePointerUp);
    this.renderRoot.addEventListener("pointercancel", this.onOctavePointerUp);
    this.renderRoot.addEventListener("pointerleave", this.onOctavePointerUp);
  }

  public override disconnectedCallback(): void {
    this.renderRoot.removeEventListener("pointerdown", this.onOctavePointerDown);
    this.renderRoot.removeEventListener("pointerup", this.onOctavePointerUp);
    this.renderRoot.removeEventListener("pointercancel", this.onOctavePointerUp);
    this.renderRoot.removeEventListener("pointerleave", this.onOctavePointerUp);

    this.activeVoicesByPointer.forEach((_, pointerId) => this.stopHeldNote(pointerId));
    void this.holdAudioContext.close();

    super.disconnectedCallback();
  }

  public playAccords(
    progression: readonly AccordStep[],
    stepWaitMs: number,
    holdMs: number
  ): void {
    const accords = new Accords(progression, stepWaitMs, holdMs);
    accords.play(({ notes, holdMs: noteHoldMs }) => {
      notes.forEach((note) => this.playNote(note, noteHoldMs));
    });
  }

  public playDemoChords(): void {
    this.playAccords(
      [
        { notes: ["C", "E", "G"], waitBeforeMs: 0, holdMs: 1400 },
        { notes: ["F", "A", "C"], waitBeforeMs: 1700, holdMs: 1450 },
        { notes: ["G", "H", "D"], waitBeforeMs: 1750, holdMs: 1500 },
        { notes: ["C", "E", "G"], waitBeforeMs: 1900, holdMs: 1800 }
      ],
      1700,
      1450
    );
  }

  protected override render(): TemplateResult {
    const items = this.createLayoutItems();

    return html`
      <div
        class="octave-stage"
        style="
          position: ${this.position};
          width: ${this.width};
          height: ${this.height};
          top: ${this.top};
          left: ${this.left};
        "
      >
        <div class="tangent-layer">
          ${items.map((item) => this.renderTangent(item))}
        </div>
      </div>
    `;
  }

  private getTangentBaseNote(item: {
    readonly note?: string;
    readonly geometry: { readonly name: string };
  }): string {
    const note = item.note ?? item.geometry.name;

    if (typeof note !== "string" || note.length === 0) {
      throw new Error("Cannot render tangent because note is missing.");
    }

    return note;
  }

  private renderTangent(item: TangentLayoutItem): TemplateResult {
    return html`
      <piano-tangent
        style="
          left: ${item.leftPercent}%;
          top: ${item.topPercent}%;
          width: ${item.widthPercent}%;
          height: ${item.heightPercent}%;
          z-index: ${item.zIndex};
        "
        .geometry=${item.geometry}
        .tangentId=${this.tangentNamePolicy.toTangentId(this.getTangentBaseNote(item), this.octaveIndex)}
        .note=${this.getTangentBaseNote(item)}
        .isBlack=${item.isBlack}
        .showBox=${this.showBox}
        .boxWidthRatio=${this.boxWidthRatio}
        .boxDepthRatio=${this.boxDepthRatio}
        .template=${this.template}
      ></piano-tangent>
    `;
  }

  private createLayoutItems(): readonly TangentLayoutItem[] {
    const allTangents = [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys.map((geometry) => this.createLayoutItem(geometry, false)),
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys.map((geometry) => this.createLayoutItem(geometry, true))
    ];

    return allTangents;
  }

  private createLayoutItem(
    geometry: LegacyTangentGeometry,
    isBlack: boolean
  ): TangentLayoutItem {
    const bounds = this.readBounds(geometry);
    const octaveBounds = this.readOctaveBounds();

    return {
      geometry,
      isBlack,
      leftPercent: ((bounds.minX - octaveBounds.minX) / octaveBounds.width) * 100,
      topPercent: ((octaveBounds.maxY - bounds.maxY) / octaveBounds.height) * 100,
      widthPercent: (bounds.width / octaveBounds.width) * 100,
      heightPercent: (bounds.height / octaveBounds.height) * 100,
      zIndex: isBlack ? 2 : 1
    };
  }

  private readOctaveBounds(): TangentBounds {
    const allPoints = [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys.flatMap((geometry) => geometry.points),
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys.flatMap((geometry) => geometry.points)
    ];

    return this.readBoundsFromPoints(allPoints);
  }

  private readBounds(geometry: LegacyTangentGeometry): TangentBounds {
    return this.readBoundsFromPoints(geometry.points);
  }

  private readBoundsFromPoints(points: readonly (readonly [number, number])[]): TangentBounds {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY)
    };
  }

  private flashNoteByName(note: string): void {
    const polygon = this.findPolygonByNote(note);
    if (polygon !== null) {
      this.flashNote(polygon);
    }
  }

  private findPolygonByNote(note: string): SVGPolygonElement | null {
    const tangents = Array.from(this.renderRoot.querySelectorAll("piano-tangent"));

    for (const tangent of tangents) {
      if (!(tangent instanceof Tangent)) {
        continue;
      }

      if (tangent.note !== note && tangent.tangentId !== note) {
        continue;
      }

      const polygon = tangent.shadowRoot?.querySelector(`polygon[data-note="${note}"]`);
      if (polygon instanceof SVGPolygonElement) {
        return polygon;
      }
    }

    return null;
  }

  private flashNote(polygon: SVGPolygonElement): void {
    const isBlack = polygon.dataset.isBlack === "1";
    const pressedColor = isBlack ? "#3b82f6" : "#93c5fd";
    const baseColor = isBlack ? "#000" : "#fff";

    polygon.getAnimations().forEach((animation) => animation.cancel());
    polygon.animate(
      [
        { fill: pressedColor, offset: 0 },
        { fill: pressedColor, offset: 0.35 },
        { fill: baseColor, offset: 1 }
      ],
      { duration: 500, easing: "linear", fill: "forwards" }
    );
  }

  private setPressedVisual(polygon: SVGPolygonElement, pressed: boolean): void {
    const isBlack = polygon.dataset.isBlack === "1";
    const pressedColor = isBlack ? "#3b82f6" : "#93c5fd";
    const baseColor = isBlack ? "#000" : "#fff";

    const rootNode = polygon.getRootNode();
    if (rootNode instanceof ShadowRoot && rootNode.host instanceof Tangent) {
      rootNode.host.pressed = pressed;
    }

    polygon.getAnimations().forEach((animation) => animation.cancel());
    polygon.setAttribute("fill", pressed ? pressedColor : baseColor);
  }
  private createOctaveEventDetail(): { readonly index: number } {
    return { index: this.octaveIndex };
  }


  private playNote(note: string, holdMs: number = 280, sustain: number = 0.9): void {
    const midiNote = this.midiNoteMapper.toMidi(note, this.octaveIndex);
    if (midiNote === null) {
      return;
    }

    const holdId = `${this.octaveIndex}:${note}:song:${this.syntheticHoldSequence++}`;

    this.flashNoteByName(note);

    this.dispatchEvent(
      new CustomEvent<TangentHoldStartDetail>(PianoEventName.TangentHoldStart, {
        detail: {
          holdId,
          note,
          octaveIndex: this.octaveIndex,
          octave: this.createOctaveEventDetail(),
          midiNote: midiNote
        },
        bubbles: true,
        composed: true
      })
    );

    this.midiPlayer.play(
      createNoteOn(
        this.midiChannel,
        MidiNote.create(midiNote),
        this.midiVelocity
      ),
      {
        noteLengthSeconds: holdMs / 1000,
        sustain
      }
    );

    window.setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent<TangentHoldEndDetail>(PianoEventName.TangentHoldEnd, {
          detail: {
          holdId,
          note,
          holdMs,
          octaveIndex: this.octaveIndex,
          octave: this.createOctaveEventDetail(),
          midiNote: midiNote
        },
          bubbles: true,
          composed: true
        })
      );
    }, holdMs);
  }

  private startHeldNote(
    pointerId: number,
    note: string,
    polygon: SVGPolygonElement,
    holdId: string
  ): void {
    const midiNote = this.midiNoteMapper.toMidi(note, this.octaveIndex);
    if (midiNote === null) {
      return;
    }

    this.stopHeldNote(pointerId);
    void this.holdAudioContext.resume();

    const now = this.holdAudioContext.currentTime;
    const osc = this.holdAudioContext.createOscillator();
    const gain = this.holdAudioContext.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);

    osc.connect(gain);
    gain.connect(this.holdAudioContext.destination);
    osc.start(now);

    this.activeVoicesByPointer.set(pointerId, {
      holdId,
      note,
      midiNote: midiNote,
      osc,
      gain,
      polygon,
      startedAtMs: performance.now()
    });
  }

  private stopHeldNote(pointerId: number): void {
    const voice = this.activeVoicesByPointer.get(pointerId);
    if (voice === undefined) {
      return;
    }

    const now = this.holdAudioContext.currentTime;

    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, now + 0.18);
    voice.osc.stop(now + 0.2);

    this.setPressedVisual(voice.polygon, false);

    this.dispatchEvent(
      new CustomEvent<TangentHoldEndDetail>(PianoEventName.TangentHoldEnd, {
        detail: {
          holdId: voice.holdId,
          note: voice.note,
          holdMs: Math.max(0, performance.now() - voice.startedAtMs),
          octaveIndex: this.octaveIndex,
          octave: this.createOctaveEventDetail(),
          midiNote: voice.midiNote
        },
        bubbles: true,
        composed: true
      })
    );

    this.activeVoicesByPointer.delete(pointerId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-octave": PianoOctave;
  }
}