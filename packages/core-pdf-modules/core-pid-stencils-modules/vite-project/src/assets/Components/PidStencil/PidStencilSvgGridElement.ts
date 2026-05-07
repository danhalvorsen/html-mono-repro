import { css, html, LitElement, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../WebCard/WebCardElement.js";
import type { IWebCardSectionTemplates } from "../WebCard/IWebCardSectionTemplates.js";
import { FetchPidStencilSvgManifestRepository } from "./PidStencilSvgManifestRepository.js";
import { PidStencilSvgGroupFilter } from "./PidStencilSvgGroupFilter.js";
import type { PidStencilSvgViewModel } from "./PidStencilSvgViewModel.js";
import { PidStencilSvgCardTemplatesFactory } from "./Templates/PidStencilSvgCardTemplatesFactory.js";

@customElement("pid-stencil-svg-grid")
export class PidStencilSvgGridElement extends LitElement {
  public static override styles: CSSResultGroup = css`
    :host {
      display: block;
      box-sizing: border-box;
      width: 100%;
      min-height: 100svh;
      padding: 2rem;
      background: #f3f4f6;
      color: #111827;
    }

    .shell {
      display: grid;
      gap: 1.5rem;
      width: min(1600px, 100%);
      margin: 0 auto;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
    }

    .title-block {
      display: grid;
      gap: 0.35rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.75rem, 2vw, 2.5rem);
      line-height: 1.1;
    }

    .count {
      color: #6b7280;
      font-size: 0.95rem;
    }

    details.group-filter {
      position: relative;
      min-width: 18rem;
    }

    details.group-filter > summary {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: 1px solid rgb(17 24 39 / 16%);
      border-radius: 0.75rem;
      background: #ffffff;
      cursor: pointer;
      user-select: none;
      box-sizing: border-box;
    }

    .group-filter__menu {
      position: absolute;
      z-index: 10;
      top: calc(100% + 0.5rem);
      right: 0;
      display: grid;
      gap: 0.5rem;
      width: min(28rem, calc(100vw - 4rem));
      max-height: 24rem;
      overflow: auto;
      padding: 0.75rem;
      border: 1px solid rgb(17 24 39 / 16%);
      border-radius: 0.75rem;
      background: #ffffff;
      box-shadow: 0 12px 30px rgb(0 0 0 / 16%);
      box-sizing: border-box;
    }

    .group-filter__actions {
      display: flex;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgb(17 24 39 / 10%);
    }

    button {
      border: 1px solid rgb(17 24 39 / 16%);
      border-radius: 0.5rem;
      background: #ffffff;
      color: #111827;
      padding: 0.45rem 0.65rem;
      cursor: pointer;
    }

    button:hover {
      background: #f9fafb;
    }

    label.group-filter__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      line-height: 1.2;
      cursor: pointer;
    }

    input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      margin: 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      align-items: stretch;
    }

    web-card {
      min-height: 240px;
    }

    .message {
      padding: 1rem;
      border: 1px solid rgb(17 24 39 / 12%);
      border-radius: 0.75rem;
      background: #ffffff;
    }
  `;

  private readonly repository = new FetchPidStencilSvgManifestRepository();
  private readonly filter = new PidStencilSvgGroupFilter();

  private readonly sectionTemplates: IWebCardSectionTemplates<PidStencilSvgViewModel> =
    new PidStencilSvgCardTemplatesFactory().create();

  @state()
  private items: readonly PidStencilSvgViewModel[] = [];

  @state()
  private selectedGroupIds: readonly string[] = [];

  @state()
  private errorMessage = "";

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected override render(): TemplateResult {
    if (this.errorMessage.length > 0) {
      return html`
        <section class="shell">
          <div class="message">${this.errorMessage}</div>
        </section>
      `;
    }

    const result = this.filter.filter(this.items, this.selectedGroupIds);
    const selectedCount = this.selectedGroupIds.length;

    return html`
      <section class="shell">
        <header class="toolbar">
          <div class="title-block">
            <h1>PID stencil SVG files</h1>
            <div class="count">
              ${result.visibleItems.length} / ${this.items.length} SVG files
            </div>
          </div>

          <details class="group-filter">
            <summary>
              <span>Groups</span>
              <span>${selectedCount} selected</span>
            </summary>

            <div class="group-filter__menu">
              <div class="group-filter__actions">
                <button type="button" @click=${this.selectAllGroups}>
                  Select all
                </button>
                <button type="button" @click=${this.clearGroups}>
                  Clear
                </button>
              </div>

              ${result.availableGroupIds.map(
                (groupId) => html`
                  <label class="group-filter__item">
                    <input
                      type="checkbox"
                      .checked=${this.isGroupSelected(groupId)}
                      @change=${(event: Event) =>
                        this.toggleGroup(groupId, event)}
                    />
                    <span>${groupId}</span>
                  </label>
                `,
              )}
            </div>
          </details>
        </header>

        <div class="grid">
          ${result.visibleItems.map(
            (item) => html`
              <web-card
                .model=${item}
                .sectionTemplates=${this.sectionTemplates}
              ></web-card>
            `,
          )}
        </div>
      </section>
    `;
  }

  private async load(): Promise<void> {
    try {
      const loadedItems = await this.repository.load();
      const groupIds = this.filter.getAvailableGroupIds(loadedItems);

      this.items = loadedItems;
      this.selectedGroupIds = groupIds;
      this.errorMessage = "";
    }
    catch (error) {
      this.items = [];
      this.selectedGroupIds = [];
      this.errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  private isGroupSelected(groupId: string): boolean {
    return this.selectedGroupIds.includes(groupId);
  }

  private toggleGroup(groupId: string, event: Event): void {
    const input = event.currentTarget as HTMLInputElement;

    if (input.checked) {
      this.selectedGroupIds = [...new Set([...this.selectedGroupIds, groupId])]
        .sort((left, right) => left.localeCompare(right));
      return;
    }

    this.selectedGroupIds = this.selectedGroupIds.filter(
      (selectedGroupId) => selectedGroupId !== groupId,
    );
  }

  private readonly selectAllGroups = (): void => {
    this.selectedGroupIds = this.filter.getAvailableGroupIds(this.items);
  };

  private readonly clearGroups = (): void => {
    this.selectedGroupIds = [];
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "pid-stencil-svg-grid": PidStencilSvgGridElement;
  }
}