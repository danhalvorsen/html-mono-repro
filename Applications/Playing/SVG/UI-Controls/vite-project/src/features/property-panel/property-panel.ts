import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { propertyPanelStyles } from '../../application/ui-style-module.js'
import type {
  PropertyPanelEntry,
  PropertyValue,
} from '../../domain/property-panel.js'

@customElement('property-panel')
export class PropertyPanel extends LitElement {
  @property({ type: String })
  title = 'Properties'

  @property({ type: String, attribute: 'shape-name' })
  shapeName = ''

  @property({ type: String, attribute: 'entries-json' })
  entriesJson = '[]'

  @property({ attribute: false })
  entries: ReadonlyArray<PropertyPanelEntry> = []

  private formatValue(value: PropertyValue): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }
    if (value === null) {
      return 'null'
    }
    return String(value)
  }

  private parseEntriesJson(): ReadonlyArray<PropertyPanelEntry> {
    try {
      const parsed = JSON.parse(this.entriesJson) as unknown
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed
        .filter((entry): entry is Record<string, unknown> => {
          return entry !== null && typeof entry === 'object'
        })
        .filter((entry) => typeof entry.name === 'string')
        .map((entry) => ({
          name: String(entry.name),
          value:
            typeof entry.value === 'string' ||
            typeof entry.value === 'number' ||
            typeof entry.value === 'boolean' ||
            entry.value === null
              ? entry.value
              : String(entry.value),
        }))
    } catch {
      return []
    }
  }

  private get resolvedEntries(): ReadonlyArray<PropertyPanelEntry> {
    if (this.entries.length > 0) {
      return this.entries
    }
    return this.parseEntriesJson()
  }

  render() {
    const rows = this.resolvedEntries
    return html`
      <section class="panel">
        <header>
          <h3>${this.title}</h3>
          ${this.shapeName !== '' ? html`<p>${this.shapeName}</p>` : null}
        </header>
        ${rows.length === 0
          ? html`<p class="empty">No properties.</p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(
                    (row) => html`
                      <tr>
                        <td class="name">${row.name}</td>
                        <td class="value">${this.formatValue(row.value)}</td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `}
      </section>
    `
  }

  static styles = propertyPanelStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'property-panel': PropertyPanel
  }
}
