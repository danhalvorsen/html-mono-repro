import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  PianoEventName,
  type TangentHoldEndDetail,
  type TangentHoldStartDetail,
} from "../application/PianoEventContracts";
import {
  DefaultPianoRootConfiguration,
  type PianoOctaveConfiguration,
  type PianoTangentConfiguration,
} from "./PianoRootConfiguration";
import { type TangentInputEventDetail } from "./PianoRootEventContracts";
import "./tangent-wc";

type ActiveHold = {
  readonly holdId: string;
  readonly pointerId: number;
  readonly note: string;
  readonly midiNote: number;
  readonly octaveIndex: number;
  readonly startedAtMs: number;
};

function getDefaultOctaveConfiguration(): PianoOctaveConfiguration {
  const octave = DefaultPianoRootConfiguration.octaves[0];

  if (octave === undefined) {
    throw new Error("Missing default octave configuration.");
  }

  return octave;
}

@customElement("piano-octave")
export class PianoOctave extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
    }

    .octave-stage {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      box-sizing: border-box;
      touch-action: none;
      background: transparent;
    }
  `;

  @property({ attribute: false })
  public options: PianoOctaveConfiguration = getDefaultOctaveConfiguration();
  private readonly activeHoldsByPointer = new Map<number, ActiveHold>();

  protected override firstUpdated(): void {
    this.applyHostLayout();
  }

  protected override updated(): void {
    this.applyHostLayout();
  }

  protected override render(): TemplateResult {
    return html`
      <div
        class="octave-stage"
        @tangent-pressed=${this.onTangentPressed}
        @tangent-released=${this.onTangentReleased}
      >
        ${this.getTangentsInRenderOrder().map((tangent) =>
          this.renderTangent(tangent),
        )}
      </div>
    `;
  }

  private renderTangent(tangent: PianoTangentConfiguration): TemplateResult {
    return html`
      <tangent-wc
        .options=${tangent}
        .viewBox=${this.options.viewBox}
      ></tangent-wc>
    `;
  }

  private getTangentsInRenderOrder(): readonly PianoTangentConfiguration[] {
    return [...this.options.tangents].sort(
      (left, right) => left.layout.zIndex - right.layout.zIndex,
    );
  }

  private readonly onTangentPressed = (event: Event): void => {
    const customEvent = event as CustomEvent<TangentInputEventDetail>;
    const tangent = customEvent.detail.tangent;

    if (tangent.midiNote === null || this.activeHoldsByPointer.has(customEvent.detail.pointerId)) {
      return;
    }

    const holdId = `${tangent.id}:${customEvent.detail.pointerId}:${performance.now()}`;
    this.activeHoldsByPointer.set(customEvent.detail.pointerId, {
      holdId,
      pointerId: customEvent.detail.pointerId,
      note: tangent.note,
      midiNote: tangent.midiNote,
      octaveIndex: this.options.octaveIndex,
      startedAtMs: performance.now(),
    });

    this.dispatchEvent(
      new CustomEvent<TangentHoldStartDetail>(PianoEventName.TangentHoldStart, {
        detail: {
          holdId,
          note: tangent.note,
          octaveIndex: this.options.octaveIndex,
          octave: { index: this.options.octaveIndex },
          midiNote: tangent.midiNote,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly onTangentReleased = (event: Event): void => {
    const customEvent = event as CustomEvent<TangentInputEventDetail>;
    const activeHold = this.activeHoldsByPointer.get(customEvent.detail.pointerId);
    if (activeHold === undefined) {
      return;
    }

    this.activeHoldsByPointer.delete(customEvent.detail.pointerId);
    const holdMs = Math.max(0, performance.now() - activeHold.startedAtMs);

    this.dispatchEvent(
      new CustomEvent<TangentHoldEndDetail>(PianoEventName.TangentHoldEnd, {
        detail: {
          holdId: activeHold.holdId,
          note: activeHold.note,
          holdMs,
          octaveIndex: activeHold.octaveIndex,
          octave: { index: activeHold.octaveIndex },
          midiNote: activeHold.midiNote,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private applyHostLayout(): void {
    this.style.position = this.options.cssPosition;
    this.style.left = `${this.options.position.x}px`;
    this.style.top = `${this.options.position.y - 4}px`;
    this.style.width = `${this.options.size.x}px`;
    this.style.height = `${this.options.size.y}px`;
    this.style.display = "block";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-octave": PianoOctave;
  }
}
