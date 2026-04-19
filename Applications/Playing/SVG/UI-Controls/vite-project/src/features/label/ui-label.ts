import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import { uiLabelStyles } from '../../application/ui-style-module.js'
import { buildLabelSvgTemplate, type LabelState } from './label-template.js'
import type {
  UiShape,
  UiTheme,
  UiVariant,
} from '../../domain/design-variants.js'

@customElement('ui-label')
export class UiLabel extends LitElement {
  @property({ type: String })
  value = 'Label'

  @property({ type: Number })
  scale = 1

  @property({ type: String, reflect: true })
  state: LabelState = 'default'

  @property({ type: String, reflect: true })
  variant: UiVariant = 'flat'

  @property({ type: String, reflect: true })
  theme: UiTheme = 'dark'

  @property({ type: String, reflect: true })
  shape: UiShape = 'pill'

  @property({ type: Boolean, reflect: true })
  compact = false

  private get normalizedScale() {
    return Math.max(0.05, this.scale)
  }

  private get textValue() {
    const trimmed = this.value.trim()
    return trimmed === '' ? 'Label' : trimmed
  }

  render() {
    return html`
      <section class=${`ui-label${this.compact ? ' compact' : ''}`}>
        <svg-template-host
          ?compact=${this.compact}
          .templateInput=${buildLabelSvgTemplate(
            this.textValue,
            this.normalizedScale,
            this.state,
            this.variant,
            this.theme,
            this.shape,
          )}
        ></svg-template-host>
      </section>
    `
  }

  static styles = uiLabelStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-label': UiLabel
  }
}
