import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { currentViewPresenterStyles } from '../../application/ui-style-module.js'
import type { ViewSource } from '../../domain/view-navigation.js'

@customElement('current-view-presenter')
export class CurrentViewPresenter extends LitElement {
  @property({ attribute: false })
  views: ReadonlyArray<ViewSource> = [
    { id: 'label-feature', path: '/views/label-feature.html' },
    { id: 'circle-shape', path: '/views/circle-shape.html' },
    { id: 'rectangle-shape', path: '/views/rectangle-shape.html' },
    { id: 'triangle-shape', path: '/views/triangle-shape.html' },
    { id: 'line-shape', path: '/views/line-shape.html' },
    { id: 'knob-shape', path: '/views/knob-shape.html' },
    {
      id: 'triangle-indicator-knob',
      path: '/views/triangle-indicator-knob.html',
    },
    { id: 'property-panel', path: '/views/property-panel.html' },
    { id: 'web-card', path: '/views/web-card.html' },
    { id: 'dual-sector-shape', path: '/views/dual-sector-shape.html' },
    {
      id: 'distrbuted-distribution',
      path: '/views/distrbuted-distribution.html',
    },
    { id: 'combined-demo', path: '/views/combined-demo.html' },
    {
      id: 'circle-label-distribution',
      path: '/views/circle-label-distribution.html',
    },
    { id: 'svg-template-host', path: '/views/svg-template-host.html' },
  ]

  @property({ type: String, attribute: 'active-view' })
  activeView = ''

  @state()
  private viewHtml = ''

  @state()
  private loading = false

  private readonly viewCache = new Map<string, string>()

  private isHtmlFragment(text: string): boolean {
    const sample = text.slice(0, 1200).toLowerCase()
    return !(
      sample.includes('<!doctype') ||
      sample.includes('<html') ||
      sample.includes('<body')
    )
  }

  setActiveView(view: string) {
    this.activeView = view
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('views')) {
      const isKnown = this.views.some((view) => view.id === this.activeView)
      if (!isKnown && this.views.length > 0) {
        this.activeView = this.views[0]!.id
      }
    }
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('activeView') || changed.has('views')) {
      void this.loadCurrentViewHtml()
    }
  }

  private async loadCurrentViewHtml() {
    const view = this.views.find((item) => item.id === this.activeView)
    if (view === undefined) {
      this.viewHtml = '<p>No view selected.</p>'
      this.loading = false
      return
    }

    const cached = this.viewCache.get(view.path)
    if (cached !== undefined) {
      this.viewHtml = cached
      this.loading = false
      return
    }

    this.loading = true
    this.viewHtml = ''

    try {
      const response = await fetch(view.path, { cache: 'no-cache' })
      if (!response.ok) {
        throw new Error(`Failed to load ${view.path}`)
      }
      const text = await response.text()
      if (!this.isHtmlFragment(text)) {
        throw new Error(`Expected HTML fragment for ${view.path}`)
      }
      this.viewCache.set(view.path, text)
      if (this.activeView === view.id) {
        this.viewHtml = text
      }
    } catch {
      if (this.activeView === view.id) {
        this.viewHtml = '<p>Failed to load view HTML.</p>'
      }
    } finally {
      if (this.activeView === view.id) {
        this.loading = false
      }
    }
  }

  render() {
    return html`
      <section class="presenter">
        ${this.loading
          ? html`<p>Loading view...</p>`
          : this.viewHtml === ''
            ? html`<p>No content.</p>`
            : unsafeHTML(this.viewHtml)}
      </section>
    `
  }

  static styles = currentViewPresenterStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'current-view-presenter': CurrentViewPresenter
  }
}
