import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type {
  UiShape,
  UiTheme,
  UiVariant,
} from '../../domain/design-variants.js'
import { webCardStyles } from '../../application/ui-style-module.js'

@customElement('web-card')
export class WebCard extends LitElement {
  @property({ type: String, attribute: 'header-title' })
  headerTitle = 'Feature Card'

  @property({ type: String, attribute: 'footer-text' })
  footerText = 'Footer'

  @property({ type: String, reflect: true })
  variant: UiVariant = 'flat'

  @property({ type: String, reflect: true })
  theme: UiTheme = 'dark'

  @property({ type: String, reflect: true })
  shape: UiShape = 'round'

  render() {
    return html`
      <article class="card">
        <header>
          <slot name="header">${this.headerTitle}</slot>
        </header>
        <main>
          <slot>
            <p>No feature content.</p>
          </slot>
        </main>
        <footer>
          <slot name="footer">${this.footerText}</slot>
        </footer>
      </article>
    `
  }

  static styles = webCardStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'web-card': WebCard
  }
}
