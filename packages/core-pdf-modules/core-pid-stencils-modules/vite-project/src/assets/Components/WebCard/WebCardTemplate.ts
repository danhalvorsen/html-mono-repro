import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../Templating/IComponentTemplate.js";
import type { IWebCardSectionTemplates } from "./IWebCardSectionTemplates.js";

export class WebCardTemplate<TModel> implements IComponentTemplate<TModel> {
  private readonly sectionTemplates: IWebCardSectionTemplates<TModel>;

  public constructor(sectionTemplates: IWebCardSectionTemplates<TModel>) {
    this.sectionTemplates = sectionTemplates;
  }

  public render(model: TModel): TemplateResult {
    return html`
      <article class="web-card">
        <header class="web-card__header">
          ${this.sectionTemplates.header.render(model)}
        </header>

        <main class="web-card__main">
          ${this.sectionTemplates.main.render(model)}
        </main>

        <footer class="web-card__footer">
          ${this.sectionTemplates.footer.render(model)}
        </footer>
      </article>
    `;
  }
}