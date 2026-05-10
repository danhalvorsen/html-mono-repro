import { css, html, LitElement, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IWebCardSectionTemplates } from "./IWebCardSectionTemplates.js";
import { WebCardSectionTemplatesFactory } from "./WebCardSectionTemplatesFactory.js";
import { WebCardTemplate } from "./WebCardTemplate.js";

@customElement("web-card")
export class WebCardElement<TModel = unknown> extends LitElement {
  public static override styles: CSSResultGroup = css`
    :host {
      display: block;
      min-width: 0;
      height: 100%;
    }

    .web-card {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 0.75rem;
      height: 100%;
      min-width: 0;
      padding: 1rem;
      border: 1px solid rgb(17 24 39 / 14%);
      border-radius: 0.875rem;
      background: #ffffff;
      color: #111827;
      box-shadow: 0 1px 4px rgb(0 0 0 / 10%);
      box-sizing: border-box;
    }

    .web-card__header,
    .web-card__main,
    .web-card__footer {
      min-width: 0;
    }

    .web-card__main {
      display: grid;
      place-items: center;
      min-height: 8rem;
    }

    .web-card__footer {
      color: #6b7280;
      font-size: 0.75rem;
      overflow-wrap: anywhere;
    }
  `;

  @property({ attribute: false })
  public model: TModel | undefined;

  @property({ attribute: false })
  public sectionTemplates: IWebCardSectionTemplates<TModel> =
    new WebCardSectionTemplatesFactory().createEmpty<TModel>();

  protected override render(): TemplateResult {
    if (this.model === undefined) {
      return html``;
    }

    return new WebCardTemplate(this.sectionTemplates).render(this.model);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "web-card": WebCardElement;
  }
}