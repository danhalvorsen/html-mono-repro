import { LitElement, css, html, type TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './menu-item.js'
import './menu-wc.js'
import './views/view-home.js'
import './views/view-octave.js'
import './views/view-settings.js'
import type { MenuViewChangeDetail } from './menu-wc.js'

type AppView = 'home' | 'octave' | 'settings'

type ViewMenuItem = {
  readonly id: AppView
  readonly label: string
  readonly icon: string
}

const VIEW_ITEMS: readonly ViewMenuItem[] = Object.freeze([
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'octave', label: 'Octave', icon: 'O' },
  { id: 'settings', label: 'Settings', icon: 'S' },
])

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100svh;
      color: #1f2a37;
      background: #f7f8fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100svh;
    }

    .content {
      padding: 14px;
      overflow: auto;
    }

    @media (max-width: 700px) {
      .app-shell {
        grid-template-columns: 1fr;
      }
    }
  `

  @state()
  private currentView: AppView = 'home'

  @state()
  private activeOctave = 4

  @state()
  private showLabels = true

  private onViewChange(event: Event): void {
    const customEvent = event as CustomEvent<MenuViewChangeDetail>
    const viewId = customEvent.detail.viewId as AppView
    if (VIEW_ITEMS.some((item) => item.id === viewId)) {
      this.currentView = viewId
    }
  }

  private onOctaveChange(event: Event): void {
    const customEvent = event as CustomEvent<number>
    this.activeOctave = customEvent.detail
  }

  private onLabelVisibilityChange(event: Event): void {
    const customEvent = event as CustomEvent<boolean>
    this.showLabels = customEvent.detail
  }

  private renderCurrentView(): TemplateResult {
    switch (this.currentView) {
      case 'home':
        return html`<view-home></view-home>`
      case 'octave':
        return html`<view-octave .octave=${this.activeOctave} .showLabels=${this.showLabels}></view-octave>`
      case 'settings':
        return html`
          <view-settings
            .octave=${this.activeOctave}
            .showLabels=${this.showLabels}
            @octave-change=${this.onOctaveChange}
            @label-visibility-change=${this.onLabelVisibilityChange}
          ></view-settings>
        `
      default:
        return html`<view-home></view-home>`
    }
  }

  protected render(): TemplateResult {
    return html`
      <main class="app-shell">
        <menu-wc title="Piano MultiView" @view-change=${this.onViewChange}>
          ${VIEW_ITEMS.map(
            (view) => html`
              <menu-item
                .viewId=${view.id}
                .label=${view.label}
                .icon=${view.icon}
                .active=${this.currentView === view.id}
              ></menu-item>
            `,
          )}
        </menu-wc>

        <section class="content">${this.renderCurrentView()}</section>
      </main>
    `
  }
}
