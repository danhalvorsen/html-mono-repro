import { LitElement, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import * as ABCJS from 'abcjs'

@customElement('my-element')
export class MyElement extends LitElement {
  @property({ type: String })
  abcNotation = `X:1
T:Hello Notes Demo
M:4/4
L:1/8
K:C
CDEF GABc | cBAG FEDC |
w: Do Re Mi Fa So La Ti Do`

  @query('#sheet')
  private sheetEl!: HTMLDivElement

  render() {
    return html`
      <main>
        <h1>Music Note Sheet</h1>
        <p>Enter ABC notation and render the score.</p>
        <textarea
          .value=${this.abcNotation}
          @input=${this.onInput}
          spellcheck="false"
        ></textarea>
        <button @click=${this.renderSheet}>Render Sheet</button>
        <div id="sheet" aria-label="Rendered music note sheet"></div>
      </main>
    `
  }

  firstUpdated() {
    this.renderSheet()
  }

  private onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement
    this.abcNotation = target.value
  }

  private renderSheet() {
    if (!this.sheetEl) return
    this.sheetEl.innerHTML = ''
    ABCJS.renderAbc(this.sheetEl, this.abcNotation, {
      responsive: 'resize',
      add_classes: true,
      staffwidth: 760,
    })
  }

  static styles = css`
    :host {
      display: block;
      width: min(900px, 100%);
      margin: 0 auto;
      padding: 1rem;
      box-sizing: border-box;
      color: #111;
    }

    main {
      display: grid;
      gap: 0.75rem;
    }

    h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    p {
      margin: 0;
      color: #444;
    }

    textarea {
      width: 100%;
      min-height: 9rem;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 0.95rem;
      border: 1px solid #bbb;
      border-radius: 8px;
      padding: 0.75rem;
      box-sizing: border-box;
      resize: vertical;
    }

    button {
      width: fit-content;
      padding: 0.55rem 1rem;
      border: none;
      border-radius: 8px;
      background: #1f6feb;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    #sheet {
      min-height: 140px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fff;
      overflow-x: auto;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
