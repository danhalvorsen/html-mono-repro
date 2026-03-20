import { LitElement, type TemplateResult, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AbstractSvgSceneCanvasElement } from '../Shapes/Canvas/CartesianSvgCanvasElement';

@customElement('shape-scene-element')
export class Scene extends LitElement {
    protected override render(): TemplateResult {
        return html`
    <section class="shell">
  <cartesian-canvas .canvasWidth=${760} .canvasHeight=${520}>
    <circle-primitive .cx=${-220} .cy=${130} .r=${52}></circle-primitive>
  </cartesian-canvas>
</section>
    `;
    }

    public static override styles = [
        AbstractSvgSceneCanvasElement.styles,
        css`
      :host {
        --ink: #14213d;
        --muted: #5b6474;
        --surface: rgba(255, 248, 239, 0.86);
        --border: rgba(148, 163, 184, 0.26);

        display: block;
        min-height: 100svh;
        color: var(--ink);
      }

      .shell {
        min-height: 100svh;
        display: grid;
        gap: 2rem;
        align-items: center;
        grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
        padding: 3rem;
        box-sizing: border-box;
      }

      .copy {
        display: grid;
        gap: 1rem;
        align-content: start;
      }

      .eyebrow {
        margin: 0;
        font-size: 0.82rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #9a3412;
        font-weight: 700;
      }

      h1 {
        margin: 0;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(2.3rem, 4.4vw, 4.6rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .lede {
        margin: 0;
        font-size: 1rem;
        line-height: 1.65;
        color: var(--muted);
        max-width: 34rem;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .legend span {
        padding: 0.55rem 0.8rem;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: var(--surface);
        backdrop-filter: blur(10px);
        font-size: 0.92rem;
      }

      @media (max-width: 980px) {
        .shell {
          grid-template-columns: 1fr;
          padding: 1.4rem;
          gap: 1.5rem;
        }

        .copy {
          text-align: left;
        }
      }
    `,
    ];
}
