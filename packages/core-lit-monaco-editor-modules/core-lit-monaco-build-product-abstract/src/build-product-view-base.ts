import { css, html, LitElement, type CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";
import {
  type IMonacoBuildProductPresenter,
  type MonacoBuildExecutionProduct,
  type MonacoBuildProductStatus,
} from "./build-product-types.js";

const DEFAULT_SOURCE_PLACEHOLDER = "// Build product will show executed code here.";
const DEFAULT_CONSOLE_PLACEHOLDER = "(no console output yet)";
const DEFAULT_GREETING_PLACEHOLDER = "(no greeting result)";
const DEFAULT_ERROR_PLACEHOLDER = "(build or runtime error)";

export abstract class MonacoBuildProductViewBase
  extends LitElement
  implements IMonacoBuildProductPresenter
{
  @property()
  public title = "Build Product";

  @property()
  public status: MonacoBuildProductStatus = "idle";

  @property({ attribute: false })
  public executedProduct?: MonacoBuildExecutionProduct;

  @property()
  public errorMessage = "";

  public static override styles: CSSResultGroup = css`
    :host {
      --view-bg: #0f1a2d;
      --view-border: #243a5f;
      --view-text: #dae6ff;
      --view-muted: #9eb2d8;

      display: block;
      height: 100%;
      color: var(--view-text);
      font-family: "Segoe UI", Tahoma, sans-serif;
    }

    section {
      box-sizing: border-box;
      height: 100%;
      border: 1px solid var(--view-border);
      border-radius: 12px;
      background: var(--view-bg);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      overflow: hidden;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      padding: 0.65rem 0.85rem;
      border-bottom: 1px solid var(--view-border);
      font-size: 0.95rem;
    }

    .status {
      color: var(--view-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.78rem;
    }

    .content {
      min-height: 0;
      display: grid;
      grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    }

    .pane {
      min-height: 0;
      overflow: auto;
      padding: 0.85rem;
      box-sizing: border-box;
    }

    .pane + .pane {
      border-top: 1px solid var(--view-border);
    }

    h4 {
      margin: 0 0 0.5rem;
      font-size: 0.82rem;
      color: var(--view-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: Consolas, "Courier New", monospace;
      font-size: 0.9rem;
      line-height: 1.45;
      color: var(--view-muted);
    }
  `;

  public presentExecutionProduct(product: MonacoBuildExecutionProduct): void {
    this.executedProduct = product;
    this.status = product.status;
    this.errorMessage = "";
  }

  public presentBuildFailure(message: string): void {
    this.status = "error";
    this.errorMessage = message;
    this.executedProduct = undefined;
  }

  public clear(): void {
    this.status = "idle";
    this.executedProduct = undefined;
    this.errorMessage = "";
  }

  public override render() {
    const product = this.executedProduct;
    const source = product?.sourceCode ?? DEFAULT_SOURCE_PLACEHOLDER;
    const consoleText =
      product?.consoleLines.join("\n") ??
      (this.status === "error"
        ? this.errorMessage || DEFAULT_ERROR_PLACEHOLDER
        : DEFAULT_CONSOLE_PLACEHOLDER);
    const greeting = product?.greetingResult ?? DEFAULT_GREETING_PLACEHOLDER;

    return html`
      <section>
        <header>
          <strong>${this.title}</strong>
          <span class="status">${this.status}</span>
        </header>

        <div class="content">
          <article class="pane">
            <h4>Executed Code</h4>
            <pre>${source}</pre>
          </article>

          <article class="pane">
            <h4>Console Output</h4>
            <pre>${consoleText}</pre>
            <h4>Greeting Result</h4>
            <pre>${greeting}</pre>
          </article>
        </div>
      </section>
    `;
  }
}
