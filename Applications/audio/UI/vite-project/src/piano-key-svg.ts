// Applications/audio/UI/vite-project/src/piano-key-svg.ts

import { LitElement, css, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  type IOnPointerHoldFillTangentHost
} from './OnClickFillTangentReactiveController.js';

type PianoKeyKind = 'white' | 'black';

interface IPolygonBounds {
  readonly width: number;
  readonly height: number;
}

@customElement('piano-key-svg')
export class PianoKeySvgElement extends LitElement implements IOnPointerHoldFillTangentHost {
  @property({ type: String, attribute: 'key-id' })
  public keyId = '';

  @property({ type: String })
  public points = '';

  @property({ type: String })
  public kind: PianoKeyKind = 'white';

  @property({ type: String })
  public label = '';

  @property({ type: String, attribute: 'base-fill-color' })
  public baseFillColor = '#ffffff';

  @property({ type: String, attribute: 'target-fill-color' })
  public targetFillColor = '#8ec5ff';

  @property({ type: Number, attribute: 'fill-duration-ms' })
  public fillDurationMs = 500;

  @property({ type: String })
  public fillColor = '#ffffff';

  public constructor() {
    super();
    this.fillColor = this.baseFillColor;
  }

  protected override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('kind') && !changedProperties.has('baseFillColor')) {
      this.baseFillColor = this.kind === 'black' ? '#111111' : '#ffffff';
    }

    if (changedProperties.has('baseFillColor') && !changedProperties.has('fillColor')) {
      this.fillColor = this.baseFillColor;
    }
  }

  protected override render() {
    if (!this.keyId || !this.points) {
      return html``;
    }

    const bounds = this.getBounds(this.points);

    return html`
      <svg
        viewBox="0 0 ${bounds.width} ${bounds.height}"
        width=${bounds.width}
        height=${bounds.height}
        role="img"
        aria-label=${this.keyId}>
        <g class=${this.kind}>
          <polygon
            id=${this.keyId}
            points=${this.points}
            fill=${this.fillColor}>
          </polygon>
          ${this.renderLabel(bounds)}
        </g>
      </svg>
    `;
  }

  private renderLabel(bounds: IPolygonBounds) {
    if (!this.label) {
      return svg``;
    }

    if (this.kind === 'white') {
      return svg`
        <text
          x=${bounds.width / 2}
          y=${bounds.height * 0.8}
          font-size=${bounds.height * 0.3}
          textLength=${bounds.width * 0.8}
          lengthAdjust="spacingAndGlyphs">
          ${this.label}
        </text>
      `;
    }

    const centerX = bounds.width / 2;
    const topY = bounds.height * 0.42;
    const fontSize = bounds.height * 0.15;

    if (!this.label.includes('#')) {
      return svg`
        <text
          x=${centerX}
          y=${bounds.height * 0.5}
          font-size=${fontSize}>
          ${this.label}
        </text>
      `;
    }

    const base = this.label.replace('#', '');

    return svg`
      <text x=${centerX} y=${topY} font-size=${fontSize}>
        <tspan x=${centerX} dy="0">${base}</tspan>
        <tspan x=${centerX} dy="1.05em">#</tspan>
      </text>
    `;
  }

  private getBounds(points: string): IPolygonBounds {
    const vertices = points
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(',').map(Number))
      .filter(
        (pair): pair is [number, number] =>
          pair.length === 2 &&
          Number.isFinite(pair[0]) &&
          Number.isFinite(pair[1])
      );

    if (vertices.length === 0) {
      throw new Error('Invalid polygon points.');
    }

    const xs = vertices.map(([x]) => x);
    const ys = vertices.map(([, y]) => y);

    return Object.freeze({
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    });
  }

  public static override styles = css`
    :host {
      display: inline-block;
      line-height: 0;
      user-select: none;
      cursor: pointer;
      touch-action: none;
    }

    svg {
      display: block;
      overflow: visible;
    }

    polygon {
      stroke: #222222;
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
    }

    text {
      pointer-events: none;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 700;
      text-anchor: middle;
    }

    .white text {
      fill: #222222;
      dominant-baseline: middle;
    }

    .black text {
      fill: #ffffff;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'piano-key-svg': PianoKeySvgElement;
  }
}
