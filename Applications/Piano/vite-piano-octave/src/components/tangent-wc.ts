import { LitElement, css, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  TangentInputEventName,
  type TangentInputEventDetail,
  type TangentKeyType,
} from "./PianoRootEventContracts";
import type { PianoOctaveViewBoxConfiguration, PianoTangentConfiguration } from "./PianoRootConfiguration";

const DEFAULT_PLAYING_FILL = "#00ff00";

@customElement("tangent-wc")
export class TangentWC extends LitElement {
  public static override styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      pointer-events: none;
      touch-action: none;
    }

    svg {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
      touch-action: none;
    }

    path {
      pointer-events: auto;
      cursor: pointer;
      stroke: #000;
      stroke-width: 0.3;
      vector-effect: non-scaling-stroke;
    }
  `;

  @property({ attribute: false })
  public options!: PianoTangentConfiguration;

  @property({ attribute: false })
  public viewBox: PianoOctaveViewBoxConfiguration | undefined;

  @state()
  private isPressed = false;

  public get isPlaying(): boolean {
    return this.isPressed;
  }

  protected override updated(): void {
    this.style.zIndex = `${this.options.layout.zIndex}`;
  }

  protected override render() {
    const options = this.options;
    if (options === undefined) {
      return svg``;
    }

    const keyType: TangentKeyType = options.isBlack ? "black" : "white";
    const fill = this.isPressed ? DEFAULT_PLAYING_FILL : options.polygon.fill;
    const vb = this.viewBox;
    const viewBox = vb
      ? `${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`
      : "0 0 100 150";
    const pathData = this.toClosedPath(options.polygon.points);

    return svg`
      <svg viewBox="${viewBox}" preserveAspectRatio="none" aria-label="${options.note}">
        <path
          id="${options.id}"
          class="${keyType}"
          fill="${fill}"
          stroke="${options.polygon.strokeColor}"
          stroke-width="${options.polygon.strokeWidth}"
          data-note="${options.note}"
          data-tangent-id="${options.id}"
          d="${pathData}"
          @mousedown=${this.onMouseDown}
          @mouseup=${this.onMouseUp}
          @mouseleave=${this.onMouseLeave}
        ></path>
      </svg>
    `;
  }

  private readonly onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    this.press(event);
  };

  private readonly onMouseUp = (event: MouseEvent): void => {
    event.preventDefault();
    this.release(event);
  };

  private readonly onMouseLeave = (event: MouseEvent): void => {
    if ((event.buttons & 1) === 1) {
      return;
    }

    event.preventDefault();
    this.release(event);
  };

  private press(event: MouseEvent): void {
    if (this.isPressed) {
      return;
    }

    this.isPressed = true;
    this.dispatchPointerEvent(TangentInputEventName.Pressed, event);
  }

  private release(event: MouseEvent): void {
    if (!this.isPressed) {
      return;
    }

    this.isPressed = false;
    this.dispatchPointerEvent(TangentInputEventName.Released, event);
  }

  private dispatchPointerEvent(eventName: string, sourceEvent: MouseEvent): void {
    const keyType: TangentKeyType = this.options.isBlack ? "black" : "white";

    this.dispatchEvent(
      new CustomEvent<TangentInputEventDetail>(eventName, {
        bubbles: true,
        composed: true,
        detail: {
          pointerId: "pointerId" in sourceEvent ? sourceEvent.pointerId : 1,
          node: this,
          tangent: {
            id: this.options.id,
            note: this.options.note,
            keyType,
            points: this.toVectorPoints(this.options.polygon.points),
            midiNote: this.options.midiNote,
          },
        },
      }),
    );
  }

  private toVectorPoints(points: readonly (readonly [number, number])[]): readonly { readonly x: number; readonly y: number }[] {
    return points.map(([x, y]) => ({ x, y }));
  }

  private toClosedPath(points: readonly (readonly [number, number])[]): string {
    const [firstPoint, ...remainingPoints] = points;

    if (firstPoint === undefined) {
      return "";
    }

    return [
      `M ${firstPoint[0]} ${firstPoint[1]}`,
      ...remainingPoints.map((point) => `L ${point[0]} ${point[1]}`),
      "Z",
    ].join(" ");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tangent-wc": TangentWC;
  }
}
