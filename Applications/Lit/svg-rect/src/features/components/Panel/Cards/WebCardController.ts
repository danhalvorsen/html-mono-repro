// src/components/webcards/WebCardController.ts
import { html, type TemplateResult } from "lit";
import type { ReactiveController, ReactiveControllerHost } from "lit";

export type WebCardParts = {
  title: () => string;
  header: () => TemplateResult;
  main: () => TemplateResult;
  footer: () => TemplateResult;
};

/**
 * Shared WebCard chrome.
 * Pure layout controller.
 */
export class WebCardController implements ReactiveController {
  private readonly parts: WebCardParts;

  constructor(host: ReactiveControllerHost, parts: WebCardParts) {
    this.parts = parts;
    host.addController(this);
  }

  hostConnected() {}
  hostDisconnected() {}

  render(): TemplateResult {
    // ✅ structured debug output
    const title = this.parts.title();

console.groupCollapsed(
  `%cWebCard%c "${title}"`,
  "color:#4FC3F7;font-weight:700",
  "color:inherit;font-weight:400"
);

console.log("parts fns:", {
  title: this.parts.title,
  header: this.parts.header,
  main: this.parts.main,
  footer: this.parts.footer,
});

// Evaluate once (no double-calls later)
const header = this.parts.header();
const main = this.parts.main();
const footer = this.parts.footer();

console.table([
  { section: "title", value: title },
  { section: "header", value: header },
  { section: "main", value: main },
  { section: "footer", value: footer },
]);

console.groupEnd();

    return html`
      <div class="mr-card">
        <div class="mr-card__section mr-card__header">
          <span>${this.parts.title()}</span>
          ${this.parts.header()}
        </div>

        <div class="mr-card__section">
          ${this.parts.main()}
        </div>

        <div class="mr-card__section mr-card__footer">
          ${this.parts.footer()}
        </div>
      </div>
    `;
  }
}