import { LitElement, html } from "lit";

import "./custom-elements.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { customElement, state } from "lit/decorators.js";

import type { IViewFeature } from "./infrastructure/IViewFeature.js";
import type { ViewChangeDetail } from "./infrastructure/NavigationEvents.js";
import { Style } from "./infrastructure/Style.js";
import { createViewFeatureCatalog } from "./infrastructure/ViewFeatureCatalog.js";

import "./features/navigationFeature/NavMenu.js";
import "./features/navigationFeature/NavMenuItem.js";

const featureCatalog = createViewFeatureCatalog();

@customElement("multi-view-app")
export class MultiViewApp extends LitElement {
  public static readonly styles = Style.appShell;

  @state()
  private selectedFeature: IViewFeature = featureCatalog.defaultFeature;

  @state()
  private selectedViewHtml = "";

  public connectedCallback(): void {
    super.connectedCallback();

    Style.installGlobal();

    void this.loadFeature(this.selectedFeature);
  }

  private readonly handleViewChange = (event: Event): void => {
    const detail = (event as CustomEvent<ViewChangeDetail>).detail;
    const feature = featureCatalog.findById(detail.view);

    if (feature === undefined) {
      this.selectedViewHtml = `<h1>Unknown view</h1><p>${detail.view}</p>`;
      return;
    }

    void this.loadFeature(feature);
  };

  private async loadFeature(feature: IViewFeature): Promise<void> {
    this.selectedFeature = feature;

    try {
      this.selectedViewHtml = await feature.loadViewHtml();
    } catch {
      this.selectedViewHtml = `<h1>Load error</h1><p>${feature.id}</p>`;
    }
  }

  public render() {
    return html`
      <section class="layout">
        <aside class="navigation-column">
          <nav-menu @view-change=${this.handleViewChange}>
            ${featureCatalog.features.map(
              (feature) => html`
                <nav-menu-item
                  .viewId=${feature.id}
                  .selected=${this.selectedFeature.id === feature.id}
                  .template=${feature.renderNavigationTemplate()}
                ></nav-menu-item>
              `,
            )}
          </nav-menu>
        </aside>

        <main class="view-column">
          ${unsafeHTML(this.selectedViewHtml)}
        </main>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "multi-view-app": MultiViewApp;
  }
}
