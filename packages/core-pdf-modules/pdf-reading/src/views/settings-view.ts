import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('pdf-settings-view')
export class PdfSettingsView extends LitElement {
  @state()
  private autoSync = true

  render() {
    return html`
      <section>
        <h2>Settings</h2>
        <p>Manage reading preferences for your multi-view workspace.</p>

        <div class="panel">
          <label>
            <span>Theme accent</span>
            <select>
              <option>Terracotta</option>
              <option>Sage</option>
              <option>Slate</option>
            </select>
          </label>

          <label>
            <span>Auto-sync annotations</span>
            <input
              type="checkbox"
              .checked=${this.autoSync}
              @change=${this.toggleSync}
            />
          </label>

          <div class="status">
            Sync status: <strong>${this.autoSync ? 'Enabled' : 'Disabled'}</strong>
          </div>
        </div>
      </section>
    `
  }

  private toggleSync(event: Event): void {
    const target = event.currentTarget as HTMLInputElement
    this.autoSync = target.checked
  }

  static styles = css`
    :host {
      display: block;
    }

    h2 {
      margin: 0;
      font-size: clamp(1.35rem, 2.3vw, 2rem);
      color: var(--bg-ink);
    }

    p {
      margin: 0.45rem 0 0;
      color: var(--text-muted);
    }

    .panel {
      margin-top: 1.2rem;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 1rem;
      background: #fff9ef;
      display: grid;
      gap: 1rem;
      max-width: 560px;
    }

    label {
      display: grid;
      gap: 0.45rem;
      color: var(--text);
      font-size: 0.9rem;
    }

    select {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.45rem 0.55rem;
      background: #fff;
      font: inherit;
      color: var(--text);
    }

    input[type='checkbox'] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--success);
    }

    .status {
      padding: 0.6rem 0.7rem;
      border-radius: 8px;
      background: #f4eddf;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .status strong {
      color: var(--success);
    }
  `
}
