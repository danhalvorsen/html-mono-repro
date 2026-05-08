import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../Game/CaveCameraDemoGameCanvas.js';

@customElement('view-cave-camera-demo')
export class ViewCaveCameraDemo extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .panel {
      display: grid;
      gap: 10px;
    }

    h2 {
      margin: 0;
      color: #bdc8f4;
      font-size: 16px;
    }

    p {
      margin: 0;
      color: #9fb0ea;
      font-size: 13px;
    }
  `;

  protected override render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>Cave Camera Demo</h2>
        <p>
          GameCanvas owns the camera and hosts the CaveGameObject. The camera follows
          the red target. The cave object is only geometry/rendering.
        </p>

        <cave-camera-demo-game-canvas></cave-camera-demo-game-canvas>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'view-cave-camera-demo': ViewCaveCameraDemo;
  }
}
