// FILE: src/views/view-cave-object.ts

import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CaveGameObject } from '../GameObjects/CaveGameObject.js';

@customElement('view-cave-object')
export class ViewCaveObject extends CaveGameObject {
  public static override styles = [
    CaveGameObject.styles,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 0;
      }

      .view {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 0;
      }

      .cave-stage {
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
      }

      .cave-controls {
        flex: 0 0 auto;
        display: grid;
        gap: 0.75rem;
        padding: 0.75rem;
        border-top: 1px solid #2f2f2f;
        background: #111;
      }
    `,
  ];

  protected override render() {
    return html`
      <section class="view">
        <div class="cave-stage">
          ${super.render()}
        </div>

        <div class="cave-controls">
          <slot name="controls"></slot>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'view-cave-object': ViewCaveObject;
  }
}