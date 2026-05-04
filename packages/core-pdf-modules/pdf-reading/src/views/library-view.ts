import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

const BOOKS: readonly string[] = [
  'Designing Data Intensive Apps',
  'Operating Systems Concepts',
  'Discrete Mathematics Notes',
  'Modern Rendering Pipelines',
  'Engineering Economics Workbook',
]

@customElement('pdf-library-view')
export class PdfLibraryView extends LitElement {
  render() {
    return html`
      <section>
        <h2>Library</h2>
        <p>Organize reading assets and quickly jump to active documents.</p>

        <ul>
          ${BOOKS.map(
            (book, index) => html`
              <li>
                <span>#${String(index + 1).padStart(2, '0')}</span>
                <strong>${book}</strong>
                <button>Open</button>
              </li>
            `,
          )}
        </ul>
      </section>
    `
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
      margin: 0.45rem 0 0;
      color: var(--text-muted);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 1.2rem 0 0;
      display: grid;
      gap: 0.65rem;
    }

    li {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 0.8rem;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 0.6rem 0.8rem;
      background: #fffcf2;
    }

    span {
      font-size: 0.75rem;
      color: var(--brand);
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    strong {
      font-size: 0.95rem;
      color: var(--text);
    }

    button {
      border: 1px solid var(--line);
      background: #f5ede0;
      border-radius: 999px;
      padding: 0.35rem 0.8rem;
      cursor: pointer;
      font-size: 0.84rem;
      color: var(--text);
    }
  `
}
