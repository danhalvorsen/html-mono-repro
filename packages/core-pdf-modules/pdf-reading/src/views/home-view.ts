import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('pdf-home-view')
export class PdfHomeView extends LitElement {
  render() {
    return html`
      <section>
        <h2>Welcome back</h2>
        <p>
          This app now runs as a multi-view Lit 3 workspace. Use the top
          navigation to move between your reading flow.
        </p>

        <div class="cards">
          <article>
            <h3>Current focus</h3>
            <p>Resume the structural systems PDF from page 128.</p>
            <span>ETA: 27 min</span>
          </article>
          <article>
            <h3>Daily target</h3>
            <p>Read 3 chapters and capture 5 notes for summary export.</p>
            <span>65% complete</span>
          </article>
          <article>
            <h3>Highlights</h3>
            <p>18 items pending review and 6 starred references.</p>
            <span>Synced 2m ago</span>
          </article>
        </div>
      </section>
    `
  }

  static styles = css`
    :host {
      display: block;
      color: var(--text);
    }

    h2 {
      margin: 0;
      font-size: clamp(1.35rem, 2.3vw, 2rem);
      color: var(--bg-ink);
    }

    p {
      margin: 0.5rem 0 0;
      color: var(--text-muted);
      max-width: 64ch;
      line-height: 1.5;
    }

    .cards {
      margin-top: 1.2rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.9rem;
    }

    article {
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 0.9rem;
      background: #fff7e8;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--bg-ink);
    }

    article p {
      margin-top: 0.45rem;
      font-size: 0.92rem;
    }

    span {
      display: inline-block;
      margin-top: 0.7rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--brand);
      font-weight: 700;
    }

    @media (max-width: 840px) {
      .cards {
        grid-template-columns: 1fr;
      }
    }
  `
}
