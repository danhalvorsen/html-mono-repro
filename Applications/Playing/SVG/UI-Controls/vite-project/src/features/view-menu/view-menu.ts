import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { viewMenuStyles } from '../../application/ui-style-module.js'
import type { MenuItem } from '../../domain/view-navigation.js'

type PresenterLike = HTMLElement & {
  activeView?: string
  setActiveView?: (view: string) => void
}

@customElement('view-menu')
export class ViewMenu extends LitElement {
  @property({ attribute: false })
  items: ReadonlyArray<MenuItem> = []

  @property({ type: String, attribute: 'active-view' })
  activeView = ''

  private presenter: PresenterLike | null = null

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('items')) {
      const isValid = this.items.some((item) => item.id === this.activeView)
      if (!isValid && this.items.length > 0) {
        this.activeView = this.items[0]!.id
      }
    }
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('activeView')) {
      this.syncPresenter()
      this.dispatchEvent(
        new CustomEvent('view-change', {
          detail: { view: this.activeView },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  private onPresenterSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement
    const [first] = slot.assignedElements({ flatten: true })
    this.presenter = (first as PresenterLike | undefined) ?? null
    this.syncPresenter()
  }

  private onSelect(view: string) {
    const item = this.items.find((entry) => entry.id === view)
    if (item?.disabled === true) {
      return
    }
    if (view === this.activeView) {
      return
    }
    this.activeView = view
  }

  private syncPresenter() {
    if (this.presenter === null) {
      return
    }

    if (typeof this.presenter.setActiveView === 'function') {
      this.presenter.setActiveView(this.activeView)
      return
    }

    this.presenter.activeView = this.activeView
    this.presenter.setAttribute('active-view', this.activeView)
  }

  render() {
    return html`
      <section class="layout">
        <aside class="menu-panel">
          <nav>
            ${this.items.map(
              (item) => html`
                <button
                  class=${[
                    item.id === this.activeView ? 'active' : '',
                    item.tone === 'destructive' ? 'destructive' : '',
                  ]
                    .filter((value) => value !== '')
                    .join(' ')}
                  @click=${() => this.onSelect(item.id)}
                  ?disabled=${item.disabled === true}
                >
                  ${item.label}
                </button>
              `,
            )}
          </nav>
        </aside>
        <section class="view-panel">
          <slot
            name="presenter"
            @slotchange=${this.onPresenterSlotChange}
          ></slot>
        </section>
      </section>
    `
  }

  static styles = viewMenuStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'view-menu': ViewMenu
  }
}
