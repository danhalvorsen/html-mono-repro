import { LitElement, html, css } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { DEFAULT_OCTAVE_GEOMETRY } from './octave/geometry/DefaultOctaveGeometry';

@customElement('piano-key')
export class PianoKey extends LitElement {
  @property({ type: Array }) points: number[][] = [];
  @property({ type: String }) name = '';
  @property({ type: String }) keyType: 'white' | 'black' = 'white';

  static styles = css`
    :host {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
    }
    svg { width: 100%; height: 100%; overflow: visible; pointer-events: auto; }
    /* Her må vi bruke fargekodene direkte slik at de vises */
    .white { fill: #ffffff; stroke: #000; stroke-width: 0.3; }
    .black { fill: #222222; stroke: #000; stroke-width: 0.3; }
    .white:hover { fill: #f0f0f0; cursor: pointer; }
    .black:hover { fill: #444444; cursor: pointer; }
  `;

  render() {
    // Hvis points er tomt, rendrer vi ingenting
    if (!this.points || this.points.length === 0) return html``;
    
    const pointsString = this.points.map(p => p.join(',')).join(' ');
    return html`
      <svg viewBox="0 0 100 150" preserveAspectRatio="none">
        <polygon class="${this.keyType}" points="${pointsString}" />
      </svg>
    `;
  }
}

const GEOMETRY_MAP: Record<string, { points: number[][]; type: 'white' | 'black' }> =
  Object.fromEntries([
    ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys.map((key) => [
      key.name,
      { type: 'white' as const, points: key.points.map(([x, y]) => [x, y]) },
    ]),
    ...DEFAULT_OCTAVE_GEOMETRY.blackKeys.map((key) => [
      key.name,
      { type: 'black' as const, points: key.points.map(([x, y]) => [x, y]) },
    ]),
  ]);

function validateGeometryMapAgainstMaster(): boolean {
  const expected = Object.fromEntries([
    ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys.map((key) => [key.name, { type: 'white', points: key.points }]),
    ...DEFAULT_OCTAVE_GEOMETRY.blackKeys.map((key) => [key.name, { type: 'black', points: key.points }]),
  ]);

  return JSON.stringify(GEOMETRY_MAP) === JSON.stringify(expected);
}

if (!validateGeometryMapAgainstMaster()) {
  throw new Error('GEOMETRY_MAP is out of sync with DEFAULT_OCTAVE_GEOMETRY');
}

@customElement('piano-octave1')
export class Octave extends LitElement {
  private static readonly logStyle =
    "color:#664d03;background:#fff3cd;font-weight:700;padding:2px 6px;border-radius:4px;";

  private log(message: string, payload?: unknown): void {
    if (payload === undefined) {
      console.log(`%cOctave%c ${message}`, Octave.logStyle, "");
      return;
    }

    console.log(`%cOctave%c ${message}`, Octave.logStyle, "", payload);
  }

  @property({ type: Number, attribute: 'pos-x' }) posX = 0;
  @property({ type: Number, attribute: 'pos-y' }) posY = 0;

  static styles = css`
    :host {
      display: block; 
      position: absolute;
      aspect-ratio: 164.5 / 150; 
      width: 300px;
    }
    .container { position: relative; width: 100%; height: 100%; }
  `;

  // Denne kjører hver gang Octave blir rendret eller endret
  connectedCallback() {
    super.connectedCallback();
    // Vi må vente et øyeblikk så barna i HTML-en rekker å bli med
    setTimeout(() => this._distributeGeometry(), 0);
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('posX') || changedProperties.has('posY')) {
      this.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
    }
  }

  _handleSlotChange() {
    this._distributeGeometry();
  }

  _distributeGeometry() {
    // Finn alle piano-key som ligger inne i denne oktaven (Light DOM)
    const keys = this.querySelectorAll('piano-key');
    
    this.log(`Fant ${keys.length} taster å konfigurere`);

    keys.forEach((key: any) => {
      const data = GEOMETRY_MAP[key.getAttribute('name') || ''];
      if (data) {
        // Vi setter verdiene direkte på objektet
        key.points = data.points;
        key.keyType = data.type;
        // Tvinger barnet til å tegne seg på nytt med de nye dataene
        if (typeof key.requestUpdate === 'function') {
          key.requestUpdate();
        }
      }
    });
  }

  render() {
    return html`
      <div class="container">
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
  }
}
