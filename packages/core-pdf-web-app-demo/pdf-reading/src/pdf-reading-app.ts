import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './views/home-view'
import './views/library-view'
import './views/reader-view'
import './views/settings-view'

type ViewId = 'home' | 'library' | 'reader' | 'settings'

type NavItem = {
  readonly id: ViewId
  readonly label: string
  readonly path: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'library', label: 'Library', path: '/library' },
  { id: 'reader', label: 'Reader', path: '/reader' },
  { id: 'settings', label: 'Settings', path: '/settings' },
] as const

@customElement('pdf-reading-app')
export class PdfReadingApp extends LitElement {
  @state()
  private activeView: ViewId = this.resolveView(window.location.pathname)

  connectedCallback(): void {
    super.connectedCallback()
    window.addEventListener('popstate', this.onPopState)
  }

  disconnectedCallback(): void {
    window.removeEventListener('popstate', this.onPopState)
    super.disconnectedCallback()
  }

  private readonly onPopState = (): void => {
    this.activeView = this.resolveView(window.location.pathname)
  }

  private resolveView(pathname: string): ViewId {
    const path = pathname.toLowerCase()
    const matchedItem = NAV_ITEMS.find((item) => item.path === path)
    return matchedItem?.id ?? 'home'
  }

  private navigate(path: string): void {
    if (window.location.pathname === path) {
      return
    }

    window.history.pushState({}, '', path)
    this.activeView = this.resolveView(path)
  }

  private renderView() {
    switch (this.activeView) {
      case 'home':
        return html`<pdf-home-view></pdf-home-view>`
      case 'library':
        return html`<pdf-library-view></pdf-library-view>`
      case 'reader':
        return html`<pdf-reader-view></pdf-reader-view>`
      case 'settings':
        return html`<pdf-settings-view></pdf-settings-view>`
      default:
        return html`<pdf-home-view></pdf-home-view>`
    }
  }

  render() {
    return html`
      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <span class="mark">PR</span>
            <div class="title-wrap">
              <p class="kicker">multi-view workspace</p>
              <h1>PDF Reading</h1>
            </div>
          </div>

          <nav aria-label="App sections">
            ${NAV_ITEMS.map(
              (item) => html`
                <button
                  class=${this.activeView === item.id ? 'active' : ''}
                  @click=${() => this.navigate(item.path)}
                >
                  ${item.label}
                </button>
              `,
            )}
          </nav>
        </header>

        <main>
          <section class="view-frame">${this.renderView()}</section>
        </main>
      </div>
    `
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100svh;
      padding: clamp(0.8rem, 2vw, 1.4rem);
    }

    .shell {
      max-width: 1060px;
      margin: 0 auto;
      min-height: calc(100svh - 2rem);
      border: 1px solid var(--line);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: var(--shadow);
      background: var(--surface);
      display: flex;
      flex-direction: column;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.2rem;
      background: linear-gradient(135deg, var(--surface), var(--surface-strong));
      border-bottom: 1px solid var(--line);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .mark {
      display: grid;
      place-items: center;
      width: 2.35rem;
      height: 2.35rem;
      border-radius: 50%;
      font-size: 0.84rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: #fff8ed;
      background: linear-gradient(165deg, var(--brand), var(--brand-soft));
    }

    .title-wrap {
      line-height: 1.1;
    }

    .kicker {
      margin: 0;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--text-muted);
    }

    h1 {
      margin: 0;
      font-size: clamp(1.15rem, 2vw, 1.48rem);
      letter-spacing: 0.015em;
      color: var(--bg-ink);
    }

    nav {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    button {
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      background: #f9f4e9;
      color: var(--text);
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }

    button:hover {
      transform: translateY(-1px);
      border-color: var(--line);
    }

    button.active {
      background: var(--bg-ink);
      color: #f9f5ea;
      border-color: var(--bg-ink);
    }

    main {
      flex: 1;
      padding: clamp(0.9rem, 2.6vw, 1.6rem);
    }

    .view-frame {
      border-radius: 14px;
      border: 1px solid rgba(155, 63, 31, 0.28);
      min-height: 65svh;
      background: rgba(255, 251, 243, 0.7);
      padding: clamp(1rem, 2.8vw, 1.8rem);
      animation: reveal 320ms ease;
    }

    @keyframes reveal {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 760px) {
      :host {
        padding: 0.5rem;
      }

      .shell {
        border-radius: 16px;
      }

      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      nav {
        width: 100%;
        justify-content: flex-start;
      }

      button {
        flex: 1 0 auto;
      }

      .view-frame {
        min-height: 58svh;
      }
    }
  `
}
