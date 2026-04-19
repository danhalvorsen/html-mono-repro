// Applications/audio/UI/vite-project/src/my-piano-octave.ts

import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
 
type PianoKeyKind = 'white' | 'black';

interface IPianoKeyModel {
  readonly keyId: string;
  readonly kind: PianoKeyKind;
  readonly label: string;
  readonly points: string;
}

interface IBlackOffset {
  readonly left: number;
}

const PianoOctaveLayout = Object.freeze({
  width: 678,
  height: 376,
  whiteOffsets: Object.freeze([0, 97, 194, 291, 388, 485, 582]),
  blackOffsets: Object.freeze<readonly IBlackOffset[]>([
    Object.freeze({ left: 58 }),
    Object.freeze({ left: 169 }),
    Object.freeze({ left: 341 }),
    Object.freeze({ left: 452 }),
    Object.freeze({ left: 562 })
  ])
});

const PianoOctaveModel = Object.freeze({
  whiteKeys: Object.freeze<readonly IPianoKeyModel[]>([
    Object.freeze({ keyId: 'key-c', kind: 'white', label: 'C', points: '0,0 58,0 58,228 97,228 97,376 0,376' }),
    Object.freeze({ keyId: 'key-d', kind: 'white', label: 'D', points: '0,376 0,228 29,228 29,0 72,0 72,228 97,228 97,376' }),
    Object.freeze({ keyId: 'key-e', kind: 'white', label: 'E', points: '0,376 0,228 42,228 42,0 99,0 99,376' }),
    Object.freeze({ keyId: 'key-f', kind: 'white', label: 'F', points: '0,0 50,0 50,228 97,228 97,376 0,376' }),
    Object.freeze({ keyId: 'key-g', kind: 'white', label: 'G', points: '0,376 0,228 20,228 20,0 64,0 64,228 97,228 97,376' }),
    Object.freeze({ keyId: 'key-a', kind: 'white', label: 'A', points: '0,376 0,228 33,228 33,0 77,0 77,228 97,228 97,376' }),
    Object.freeze({ keyId: 'key-h', kind: 'white', label: 'H', points: '0,376 0,228 46,228 46,0 96,0 96,376' })
  ]),
  blackKeys: Object.freeze<readonly IPianoKeyModel[]>([
    Object.freeze({ keyId: 'key-csharp', kind: 'black', label: 'C#', points: '0,0 68,0 68,228 0,228' }),
    Object.freeze({ keyId: 'key-dsharp', kind: 'black', label: 'D#', points: '0,0 67,0 67,228 0,228' }),
    Object.freeze({ keyId: 'key-fsharp', kind: 'black', label: 'F#', points: '0,0 67,0 67,228 0,228' }),
    Object.freeze({ keyId: 'key-gsharp', kind: 'black', label: 'G#', points: '0,0 66,0 66,228 0,228' }),
    Object.freeze({ keyId: 'key-asharp', kind: 'black', label: 'A#', points: '0,0 66,0 66,228 0,228' })
  ])
});

@customElement('my-piano-octave')
export class MyPianoOctaveElement extends LitElement {
  @property({ type: String, attribute: 'octave-id' })
  public octaveId = 'octave-1';

  protected override render() {
    return html`
      <div class="octave" data-octave-id=${this.octaveId}>
        <div class="white-layer">
          ${PianoOctaveModel.whiteKeys.map((key, index) => html`
            <piano-key-svg
              style=${this.toPositionStyle(PianoOctaveLayout.whiteOffsets[index], 0)}
              key-id=${this.buildScopedKeyId(key.keyId)}
              kind=${key.kind}
              label=${key.label}
              .points=${key.points}>
            </piano-key-svg>
          `)}
        </div>

        <div class="black-layer">
          ${PianoOctaveModel.blackKeys.map((key, index) => html`
            <piano-key-svg
              style=${this.toPositionStyle(PianoOctaveLayout.blackOffsets[index].left, 0)}
              key-id=${this.buildScopedKeyId(key.keyId)}
              kind=${key.kind}
              label=${key.label}
              .points=${key.points}>
            </piano-key-svg>
          `)}
        </div>
      </div>
    `;
  }

  private buildScopedKeyId(baseKeyId: string): string {
    return `${this.octaveId}-${baseKeyId}`;
  }

  private toPositionStyle(left: number, top: number): string {
    return `left:${left}px;top:${top}px;`;
  }

  public static override styles = css`
    :host {
      display: inline-block;
    }

    .octave {
      position: relative;
      width: 678px;
      height: 376px;
      line-height: 0;
    }

    .white-layer,
    .black-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .white-layer piano-key-svg,
    .black-layer piano-key-svg {
      position: absolute;
      top: 0;
      pointer-events: auto;
    }

    .white-layer {
      z-index: 1;
    }

    .black-layer {
      z-index: 2;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'my-piano-octave': MyPianoOctaveElement;
  }
}