import { css, html, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { MonacoBuildProductViewBase } from "@monorepo/core-lit-monaco-build-product-abstract";

type BuildProductPreviewMode = "empty" | "html" | "lit-playground" | "text";

const ABSOLUTE_OR_RELATIVE_SPECIFIER = /^(?:[a-z]+:|\/|\.\/|\.\.\/)/i;
const VITE_ID_PREFIX = "/@id/";

@customElement("build-product-html-viewer")
export class BuildProductHtmlViewer extends MonacoBuildProductViewBase {
  private readonly previewHostRef: Ref<HTMLDivElement> = createRef();
  private renderedSource = "";

  @state()
  private previewMode: BuildProductPreviewMode = "empty";

  @state()
  private previewError = "";

  public static override styles = [
    MonacoBuildProductViewBase.styles,
    css`
      .viewer {
        min-height: 0;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.8rem;
        padding: 0.55rem 0.85rem;
        border-bottom: 1px solid var(--view-border);
        color: var(--view-muted);
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .preview {
        min-height: 0;
        overflow: auto;
        padding: 0.85rem;
        box-sizing: border-box;
        background: #fff;
        color: #111;
      }

      .preview-host {
        min-height: 100%;
      }

      .placeholder {
        color: var(--view-muted);
        font-family: Consolas, "Courier New", monospace;
        white-space: pre-wrap;
      }

      .error {
        margin: 0;
        padding: 0.55rem 0.85rem;
        border-top: 1px solid var(--view-border);
        color: #ffb4b4;
        background: #2a1017;
        font-family: Consolas, "Courier New", monospace;
        font-size: 0.82rem;
        white-space: pre-wrap;
      }
    `,
  ];

  public override updated(changed: PropertyValues<this>): void {
    super.updated(changed);

    if (changed.has("executedProduct") || changed.has("status")) {
      this.renderPreviewSurface();
    }
  }

  public override render() {
    const effectiveStatus = this.previewError.length > 0 ? "error" : this.status;
    const runtimeError = effectiveStatus === "error" ? this.errorMessage || this.previewError : this.previewError;

    return html`
      <section>
        <header>
          <strong>${this.title}</strong>
          <span class="status">${effectiveStatus}</span>
        </header>
        <div class="viewer">
          <div class="meta">
            <span>Preview Mode</span>
            <strong>${this.previewMode}</strong>
          </div>

          <div class="preview">
            <div class="preview-host" ${ref(this.previewHostRef)}></div>
          </div>

          ${runtimeError ? html`<pre class="error">${runtimeError}</pre>` : ""}
        </div>
      </section>
    `;
  }

  private renderPreviewSurface(): void {
    const host = this.previewHostRef.value;
    const source = this.executedProduct?.sourceCode ?? "";

    if (!host) {
      return;
    }

    if (this.renderedSource === source && this.status !== "error") {
      return;
    }

    this.previewError = "";
    if (this.executedProduct && this.status !== "error") {
      this.errorMessage = "";
    }
    this.renderedSource = source;
    host.replaceChildren();

    if (this.status === "error") {
      this.previewMode = "text";
      host.textContent = this.errorMessage || "(build or runtime error)";
      return;
    }

    if (source.trim().length === 0) {
      this.previewMode = "empty";
      host.textContent = "(load or edit HTML/Lit, then Run)";
      return;
    }

    this.previewMode = this.resolvePreviewMode(source);

    try {
      this.mountPreviewContent(host, source, this.previewMode);
    } catch (error) {
      this.previewMode = "text";
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.setPreviewFailure(`[preview error] ${errorMessage}`);
      host.textContent = source;
    }
  }

  private resolvePreviewMode(source: string): BuildProductPreviewMode {
    const normalized = source.toLowerCase();

    if (normalized.includes("from \"lit\"") || normalized.includes("from 'lit'")) {
      return "lit-playground";
    }

    if (
      normalized.includes("<!doctype html") ||
      normalized.includes("<html") ||
      normalized.includes("<body") ||
      normalized.includes("<div") ||
      normalized.includes("<pdf-presenter")
    ) {
      return "html";
    }

    return "text";
  }

  private mountPreviewContent(
    host: HTMLDivElement,
    source: string,
    mode: BuildProductPreviewMode,
  ): void {
    if (mode === "text") {
      host.textContent = source;
      return;
    }

    const htmlDocument = this.toHtmlDocument(source);
    const fragment = document.createDocumentFragment();
    const bodyChildren = [...htmlDocument.body.childNodes];
    const scriptElements = [...htmlDocument.querySelectorAll("script")];
    const styleElements = [...htmlDocument.head.querySelectorAll("style")];

    if (styleElements.length > 0) {
      const combinedStyles = styleElements.map((node) => node.textContent ?? "").join("\n");
      const styleTag = document.createElement("style");
      styleTag.textContent = combinedStyles;
      fragment.append(styleTag);
    }

    bodyChildren
      .filter((node) => node.nodeName.toLowerCase() !== "script")
      .forEach((node) => fragment.append(node.cloneNode(true)));

    host.append(fragment);
    this.executeScripts(scriptElements, host).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.setPreviewFailure(`[script error] ${errorMessage}`);
    });
  }

  private toHtmlDocument(source: string): Document {
    const trimmed = source.trim();
    const wrappedSource =
      /<html[\s>]/i.test(trimmed) || /<!doctype html/i.test(trimmed)
        ? source
        : `<!DOCTYPE html><html><head></head><body>${source}</body></html>`;

    return new DOMParser().parseFromString(wrappedSource, "text/html");
  }

  private async executeScripts(scripts: HTMLScriptElement[], host: HTMLDivElement): Promise<void> {
    const globalWithPreviewHost = globalThis as typeof globalThis & {
      __MONACO_PREVIEW_HOST?: HTMLDivElement;
    };
    const previousPreviewHost = globalWithPreviewHost.__MONACO_PREVIEW_HOST;
    globalWithPreviewHost.__MONACO_PREVIEW_HOST = host;
    try {
      for (const script of scripts) {
        const isModule = script.type === "module";
        const code = script.textContent?.trim() ?? "";

        if (code.length === 0) {
          continue;
        }

        if (isModule) {
          const moduleCode = this.rewriteModuleSpecifiers(code);
          const blob = new Blob([moduleCode], { type: "text/javascript" });
          const url = URL.createObjectURL(blob);

          try {
            await import(/* @vite-ignore */ url);
          } finally {
            URL.revokeObjectURL(url);
          }

          continue;
        }

        const executor = new Function("previewHost", "console", code) as (
          previewHost: HTMLDivElement,
          consoleObj: Console,
        ) => void;

        executor(host, console);
      }
    } finally {
      if (previousPreviewHost) {
        globalWithPreviewHost.__MONACO_PREVIEW_HOST = previousPreviewHost;
      } else {
        delete globalWithPreviewHost.__MONACO_PREVIEW_HOST;
      }
    }
  }

  private rewriteModuleSpecifiers(code: string): string {
    const rewrite = (_fullMatch: string, rawSpecifier: string): string => {
      const rewritten = this.rewriteSingleModuleSpecifier(rawSpecifier);
      return `"${rewritten}"`;
    };

    return code
      .replace(/from\s+["']([^"']+)["']/g, (match) => {
        return match.replace(/["']([^"']+)["']/, (full, value: string) => rewrite(full, value));
      })
      .replace(/import\s+["']([^"']+)["']/g, (match) => {
        return match.replace(/["']([^"']+)["']/, (full, value: string) => rewrite(full, value));
      })
      .replace(/import\(\s*["']([^"']+)["']\s*\)/g, (_match, specifier: string) => {
        const rewritten = this.rewriteSingleModuleSpecifier(specifier);
        return `import("${rewritten}")`;
      });
  }

  private rewriteSingleModuleSpecifier(specifier: string): string {
    if (ABSOLUTE_OR_RELATIVE_SPECIFIER.test(specifier)) {
      return specifier;
    }

    return new URL(`${VITE_ID_PREFIX}${specifier}`, window.location.origin).toString();
  }

  private setPreviewFailure(message: string): void {
    this.previewError = message;
    this.errorMessage = message;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "build-product-html-viewer": BuildProductHtmlViewer;
  }
}
