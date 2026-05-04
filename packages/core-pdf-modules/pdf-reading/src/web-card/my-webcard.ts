import  { LitElement, type PropertyValues, type TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { WebCardTemplates } from "./WebCardTemplates.js";
import type { IWebCardTemplates } from "./IWebCardTemplates.js";

@customElement("mr-web-card")
export class WebCardElement extends LitElement {
  @property({ attribute: false })
  public templates: IWebCardTemplates = WebCardTemplates.empty;

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("templates")) {
      this.ensureTemplates(this.templates);
    }
  }

  protected override render(): TemplateResult {
    const templates = this.templates ?? WebCardTemplates.empty;

    return html`
      <article part="card" class="card">
        <header part="header" class="card__header">
          ${templates.headerTemplate}
        </header>

        <main part="main" class="card__main">
          ${templates.mainTemplate}
        </main>

        <footer part="footer" class="card__footer">
          ${templates.footerTemplate}
        </footer>
      </article>
    `;
  }

  private ensureTemplates(value: IWebCardTemplates | null | undefined): void {
    if (value == null) {
      throw new Error("WebCardElement.templates must be provided.");
    }

    const candidate = value as Partial<IWebCardTemplates>;

    if (!("headerTemplate" in candidate)) {
      throw new Error("WebCardElement.templates.headerTemplate is required.");
    }

    if (!("mainTemplate" in candidate)) {
      throw new Error("WebCardElement.templates.mainTemplate is required.");
    }

    if (!("footerTemplate" in candidate)) {
      throw new Error("WebCardElement.templates.footerTemplate is required.");
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-web-card": WebCardElement;
  }
}

/* usage */

const cardTemplates: IWebCardTemplates = new WebCardTemplates(
  html`<h2>User profile</h2>`,
  html`<section><p>Main content</p></section>`,
  html`<button type="button">Save</button>`,
);

html`
  <mr-web-card .templates=${cardTemplates}></mr-web-card>
`;

