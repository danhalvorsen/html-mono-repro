import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { svgTemplateHostStyles } from '../../application/ui-style-module.js'

@customElement('svg-template-host')
export class SvgTemplateHost extends LitElement {
  @property({ attribute: false })
  templateInput: TemplateResult | typeof nothing = nothing

  @property({ type: String, attribute: 'img-src' })
  imgSrc: string | null = null

  @property({ type: Boolean, reflect: true })
  compact = false

  render() {
    const content =
      this.templateInput !== nothing
        ? this.templateInput
        : this.imgSrc !== null && this.imgSrc !== ''
          ? html`<img src=${this.imgSrc} alt="Label SVG" />`
          : nothing

    return html`
      <section class=${`frame${this.compact ? ' compact' : ''}`}>
        ${content}
      </section>
    `
  }

  static styles = svgTemplateHostStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'svg-template-host': SvgTemplateHost
  }
}
