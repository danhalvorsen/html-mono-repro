import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MidiChannel, MidiNote, MidiVelocity, createNoteOn } from "@monorepo/music-core-midi";
import { EnvelopeADSR, JumpPreset, WebAudioMidiPlayer } from "@monorepo/music-core-midi-playback";
import SvgOctaveAdapter from "../adapters/SvgOctaveAdapter";
import { PIANO_EVENTS, type TangentHoldEndDetail, type TangentHoldStartDetail } from "../application/PianoEventContracts";
import { DefaultMidiNoteMapper } from "../application/DefaultMidiNoteMapper";
import { Accords, type AccordStep } from "../music/Accords";
import { DEFAULT_OCTAVE_GEOMETRY } from "../octave/geometry/DefaultOctaveGeometry";
import type { Polygon2D } from "../octave/geometry/Polygon2D";
import type { PlacedPolygon } from "../octave/PlacedPolygon";
import type { RawPolygon2D } from "../types";
import { Tangent } from "./tangent";

type HeldVoice = {
  holdId: string;
  note: string;
  osc: OscillatorNode;
  gain: GainNode;
  polygon: SVGPolygonElement;
  startedAtMs: number;
};

@customElement("piano-octave")
export class PianoOctave extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .octave-stage {
      display: block;
    }

    .octave-stage svg {
      display: block;
      width: 100%;
      height: 100%;
      touch-action: none;
    }
  `;

  @property({ type: String })
  width = "100%";

  @property({ type: String })
  height = "auto";

  @property({ type: String })
  position: "static" | "relative" | "absolute" | "fixed" | "sticky" = "relative";

  @property({ type: String, attribute: "top" })
  top = "auto";

  @property({ type: String, attribute: "left" })
  left = "auto";

  @property({ type: Number })
  gap = 4; // reserved for future spacing control

  @property({ type: Number, attribute: "octave-index" })
  octaveIndex = 0;

  private readonly adapter = new SvgOctaveAdapter();
  private readonly midiPlayer = new WebAudioMidiPlayer({
    ...JumpPreset,
    // Explicit release envelope on player side.
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
  private readonly onOctavePointerDown = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    const polygon = event
      .composedPath()
      .find((node): node is SVGPolygonElement => node instanceof SVGPolygonElement);

    if (!polygon) return;

    const note = polygon.dataset.note;
    if (!note) return;
    const holdId = `${this.octaveIndex}:${note}:${pointerEvent.pointerId}:${performance.now()}`;
    this.setPressedVisual(polygon, true);
    this.startHeldNote(pointerEvent.pointerId, note, polygon, holdId);
    this.dispatchEvent(
      new CustomEvent<TangentHoldStartDetail>(PIANO_EVENTS.tangentHoldStart, {
        detail: { holdId, note, octaveIndex: this.octaveIndex },
        bubbles: true,
        composed: true
      })
    );

    this.dispatchEvent(
      new CustomEvent(PIANO_EVENTS.tangentClick, {
        detail: { tangentId: note, note },
        bubbles: true,
        composed: true
      })
    );
  };
  private readonly onOctavePointerUp = (event: Event) => {
    const pointerEvent = event as PointerEvent;
    this.stopHeldNote(pointerEvent.pointerId);
  };
  private readonly geometryByName = new Map(
    [...DEFAULT_OCTAVE_GEOMETRY.whiteKeys, ...DEFAULT_OCTAVE_GEOMETRY.blackKeys].map((k) => [k.name, k])
  );

  private computeLayout(): PlacedPolygon[] {
    const place = (key: RawPolygon2D): PlacedPolygon => ({
      geometry: key as unknown as Polygon2D,
      isBlack: key.name.includes("s")
    });

    return [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys.map(place),
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys.map(place)
    ];
  }

  private applyGeometryToSlottedTangents(): void {
    const slot = this.renderRoot.querySelector("slot");
    if (!(slot instanceof HTMLSlotElement)) return;

    const tangents = slot
      .assignedElements({ flatten: true })
      .filter((el): el is Tangent => el instanceof Tangent);

    for (const tangent of tangents) {
      const id = tangent.tangentId ?? tangent.note ?? "";
      const geometry = this.geometryByName.get(id);
      if (!geometry) continue;

      tangent.tangentId = geometry.name;
      tangent.note = geometry.name;
      tangent.isBlack = geometry.name.includes("s");
      tangent.geometry = geometry;
    }
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

    polygon.getAnimations().forEach((animation) => animation.cancel());
    polygon.setAttribute("fill", pressed ? pressedColor : baseColor);
  }

  private flashNoteByName(note: string): void {
    const polygon = this.renderRoot.querySelector(
      `polygon[data-note="${note}"]`
    );
    if (polygon instanceof SVGPolygonElement) {
      this.flashNote(polygon);
    }
  }

  private playNote(note: string, holdMs: number = 280, sustain: number = 0.9): void {
    const midiNoteNumber = this.midiNoteMapper.toMidi(note);
    if (midiNoteNumber === null) return;
    const holdId = `${this.octaveIndex}:${note}:song:${this.syntheticHoldSequence++}`;
    this.flashNoteByName(note);
    this.dispatchEvent(
      new CustomEvent<TangentHoldStartDetail>(PIANO_EVENTS.tangentHoldStart, {
        detail: { holdId, note, octaveIndex: this.octaveIndex },
        bubbles: true,
        composed: true
      })
    );

    this.midiPlayer.play(
      createNoteOn(
        this.midiChannel,
        MidiNote.create(midiNoteNumber),
        this.midiVelocity
      ),
      {
        noteLengthSeconds: holdMs / 1000,
        sustain
      }
    );

    window.setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent<TangentHoldEndDetail>(PIANO_EVENTS.tangentHoldEnd, {
          detail: { holdId, note, holdMs, octaveIndex: this.octaveIndex },
          bubbles: true,
          composed: true
        })
      );
    }, holdMs);
  }

  private startHeldNote(pointerId: number, note: string, polygon: SVGPolygonElement, holdId: string): void {
    const midiNoteNumber = this.midiNoteMapper.toMidi(note);
    if (midiNoteNumber === null) return;

    this.stopHeldNote(pointerId);
    void this.holdAudioContext.resume();

    const now = this.holdAudioContext.currentTime;
    const osc = this.holdAudioContext.createOscillator();
    const gain = this.holdAudioContext.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 440 * Math.pow(2, (midiNoteNumber - 69) / 12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);

    osc.connect(gain);
    gain.connect(this.holdAudioContext.destination);
    osc.start(now);

    this.activeVoicesByPointer.set(pointerId, {
      holdId,
      note,
      osc,
      gain,
      polygon,
      startedAtMs: performance.now()
    });
  }

  private stopHeldNote(pointerId: number): void {
    const voice = this.activeVoicesByPointer.get(pointerId);
    if (!voice) return;

    const now = this.holdAudioContext.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, now + 0.18);
    voice.osc.stop(now + 0.2);
    this.setPressedVisual(voice.polygon, false);
    this.dispatchEvent(
      new CustomEvent<TangentHoldEndDetail>(PIANO_EVENTS.tangentHoldEnd, {
        detail: {
          holdId: voice.holdId,
          note: voice.note,
          holdMs: Math.max(0, performance.now() - voice.startedAtMs),
          octaveIndex: this.octaveIndex
        },
        bubbles: true,
        composed: true
      })
    );

    this.activeVoicesByPointer.delete(pointerId);
  }

  public playAccords(progression: readonly AccordStep[], stepWaitMs: number, holdMs: number): void {
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

  protected firstUpdated(): void {
    this.renderRoot.addEventListener("pointerdown", this.onOctavePointerDown);
    this.renderRoot.addEventListener("pointerup", this.onOctavePointerUp);
    this.renderRoot.addEventListener("pointercancel", this.onOctavePointerUp);
    this.renderRoot.addEventListener("pointerleave", this.onOctavePointerUp);
    this.applyGeometryToSlottedTangents();
    const slot = this.renderRoot.querySelector("slot");
    if (slot instanceof HTMLSlotElement) {
      slot.addEventListener("slotchange", () => this.applyGeometryToSlottedTangents());
    }
  }

  disconnectedCallback(): void {
    this.renderRoot.removeEventListener("pointerdown", this.onOctavePointerDown);
    this.renderRoot.removeEventListener("pointerup", this.onOctavePointerUp);
    this.renderRoot.removeEventListener("pointercancel", this.onOctavePointerUp);
    this.renderRoot.removeEventListener("pointerleave", this.onOctavePointerUp);
    this.activeVoicesByPointer.forEach((_, pointerId) => this.stopHeldNote(pointerId));
    void this.holdAudioContext.close();
    super.disconnectedCallback();
  }

  render() {
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
        ${this.adapter.adapt(this.computeLayout())}
      </div>
      <slot></slot>
    `;
  }
}
