import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './ui-label.js'
import { labelFeatureStyles } from '../../application/ui-style-module.js'
import type { LabelState } from './label-template.js'
import type {
  UiShape,
  UiTheme,
  UiVariant,
} from '../../domain/design-variants.js'

@customElement('label-feature')
export class LabelFeature extends LitElement {
  @property({ type: String })
  value = 'Label'

  @property({ type: String })
  title = 'Label Feature'

  @property({
    attribute: 'show-title',
    converter: {
      fromAttribute: (value: string | null) =>
        value === null ? true : value.toLowerCase() !== 'false',
      toAttribute: (value: boolean) => (value ? 'true' : 'false'),
    },
  })
  showTitle = true

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

  render() {
    return html`
      <section class="label-feature">
        ${this.showTitle ? html`<h2>${this.title}</h2>` : null}
        <ui-label
          .value=${this.value}
          .scale=${this.scale}
          .state=${this.state}
          .variant=${this.variant}
          .theme=${this.theme}
          .shape=${this.shape}
        ></ui-label>
      </section>
    `
  }

  static styles = labelFeatureStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'label-feature': LabelFeature
  }
}
