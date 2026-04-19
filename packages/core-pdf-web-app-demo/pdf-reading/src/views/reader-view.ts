import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('pdf-reader-view')
export class PdfReaderView extends LitElement {
  @state()
  private page = 12

  render() {
    return html`
      <section>
        <h2>Reader</h2>
        <p>Preview your current page position and reading metadata.</p>

        <div class="workspace">
          <div class="page">
            <header>
              <span>Document</span>
              <strong>Engineering Mathematics.pdf</strong>
            </header>
            <div class="canvas">Page ${this.page}</div>
          </div>

          <aside>
            <h3>Quick actions</h3>
            <button @click=${this.prevPage}>Previous page</button>
            <button @click=${this.nextPage}>Next page</button>
            <p>Annotation mode: active</p>
          </aside>
        </div>
      </section>
    `
  }

  private prevPage(): void {
    this.page = Math.max(1, this.page - 1)
  }

  private nextPage(): void {
    this.page += 1
  }

  static styles = css`
    :host {
      display: block;
    }

    h2 {
      margin: 0;
      font-size: clamp(1.35rem, 2.3vw, 2rem);
      color: var(--bg-ink);
    }

    p {
      margin: 0.5rem 0 0;
      color: var(--text-muted);
    }

    .workspace {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 0.9rem;
    }

    .page,
    aside {
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 0.8rem;
      background: #fffcf4;
    }

    header span {
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.68rem;
      color: var(--text-muted);
    }

    header strong {
      font-size: 0.95rem;
      color: var(--bg-ink);
    }

    .canvas {
      margin-top: 0.7rem;
      min-height: 320px;
      border-radius: 10px;
      border: 1px dashed rgba(47, 42, 31, 0.35);
      display: grid;
      place-items: center;
      background: #fff;
      font-size: 1.1rem;
      color: var(--brand);
      font-weight: 700;
    }

    h3 {
      margin: 0;
      font-size: 0.95rem;
      color: var(--bg-ink);
    }

    aside {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    button {
      border: 1px solid var(--line);
      border-radius: 9px;
      background: #f4ebdd;
      color: var(--text);
      padding: 0.5rem 0.7rem;
      text-align: left;
      cursor: pointer;
      font-size: 0.86rem;
      font-weight: 600;
    }

    @media (max-width: 860px) {
      .workspace {
        grid-template-columns: 1fr;
      }

      .canvas {
        min-height: 230px;
      }
    }
  `
}
