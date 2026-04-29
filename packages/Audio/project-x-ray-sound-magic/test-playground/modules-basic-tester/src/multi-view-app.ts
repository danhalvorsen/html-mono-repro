import { LitElement, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import "./custom-elements.js";
import "./features/navigationFeature/NavMenu.js";
import "./features/navigationFeature/NavMenuItem.js";

import type { IViewFeature } from "./infrastructure/IViewFeature.js";
import type { ViewChangeDetail } from "./infrastructure/NavigationEvents.js";
import { NavigationEvents } from "./infrastructure/NavigationEvents.js";
import { Style } from "./infrastructure/Style.js";
import { createViewFeatureCatalog } from "./infrastructure/ViewFeatureCatalog.js";

const featureCatalog = createViewFeatureCatalog();

@customElement("multi-view-app")
export class MultiViewApp extends LitElement {
  public static override readonly styles = Style.appShell;

  @state()
  private selectedFeature: IViewFeature = featureCatalog.defaultFeature;

  @state()
  private selectedViewHtml = "";

  public override connectedCallback(): void {
    super.connectedCallback();

    Style.installGlobal();

    this.addEventListener(
      NavigationEvents.ViewChange,
      this.handleViewChange as EventListener,
    );

    void this.loadFeature(this.selectedFeature);
  }

  public override disconnectedCallback(): void {
    this.removeEventListener(
      NavigationEvents.ViewChange,
      this.handleViewChange as EventListener,
    );

    super.disconnectedCallback();
  }

  public override render(): TemplateResult {
    return html`
      <aside class="navigation-column">
        <nav-menu>
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
    `;
  }

  private readonly handleViewChange = (
    event: CustomEvent<ViewChangeDetail>,
  ): void => {
    const feature = featureCatalog.findById(event.detail.view);

    if (feature === undefined) {
      this.selectedViewHtml = `<h1>Unknown view</h1><p>${event.detail.view}</p>`;
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
}

declare global {
  interface HTMLElementTagNameMap {
    "multi-view-app": MultiViewApp;
  }
}
