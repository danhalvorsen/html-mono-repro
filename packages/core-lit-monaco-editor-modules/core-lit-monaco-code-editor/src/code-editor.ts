import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import * as monaco from "monaco-editor";
import monacoEditorCss from "monaco-editor/min/vs/editor/editor.main.css?inline";
import { configureMonacoEnvironment } from "./monaco-environment.js";

export const CodeEditorEvents = {
  Change: "change",
} as const;

export interface CodeEditorChangeEventDetail {
  readonly value: string;
}

@customElement("code-editor")
export class CodeEditor extends LitElement {
  private readonly container: Ref<HTMLElement> = createRef();

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private contentDisposable?: monaco.IDisposable;
  private colorSchemeQuery?: MediaQueryList;
  private readonly colorSchemeChanged = (): void => {
    monaco.editor.setTheme(this.resolveTheme());
  };

  @property({ type: Boolean, attribute: "readonly" })
  public readOnly = false;

  @property()
  public theme?: string;

  @property()
  public language?: string;

  @property()
  public code?: string;

  public static override styles = css`
    :host {
      --editor-width: 100%;
      --editor-height: 100vh;

      display: block;
      width: var(--editor-width);
      height: var(--editor-height);
    }

    main {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `;

  public override render() {
    return html`
      <style>
        ${monacoEditorCss}
      </style>

      <main ${ref(this.container)}></main>
    `;
  }

  public override firstUpdated(): void {
    configureMonacoEnvironment();

    const host = this.container.value;

    if (!host) {
      throw new Error("Monaco editor container was not rendered.");
    }

    this.editor = monaco.editor.create(host, {
      value: this.resolveCode(),
      language: this.resolveLanguage(),
      theme: this.resolveTheme(),
      automaticLayout: true,
      readOnly: this.readOnly,
    });

    this.contentDisposable = this.editor.onDidChangeModelContent(() => {
      this.dispatchEvent(
        new CustomEvent<CodeEditorChangeEventDetail>(CodeEditorEvents.Change, {
          detail: { value: this.getValue() },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.colorSchemeQuery.addEventListener("change", this.colorSchemeChanged);
  }

  public override updated(changed: PropertyValues<this>): void {
    if (!this.editor) {
      return;
    }

    if (changed.has("readOnly")) {
      this.editor.updateOptions({ readOnly: this.readOnly });
    }

    if (changed.has("theme")) {
      monaco.editor.setTheme(this.resolveTheme());
    }

    if (changed.has("language")) {
      const model = this.editor.getModel();

      if (model) {
        monaco.editor.setModelLanguage(model, this.resolveLanguage());
      }
    }

    if (changed.has("code") && this.code !== undefined && this.code !== this.getValue()) {
      this.editor.setValue(this.code);
    }
  }

  public override disconnectedCallback(): void {
    this.colorSchemeQuery?.removeEventListener("change", this.colorSchemeChanged);
    this.contentDisposable?.dispose();
    this.editor?.dispose();

    this.colorSchemeQuery = undefined;
    this.contentDisposable = undefined;
    this.editor = undefined;

    super.disconnectedCallback();
  }

  public setValue(value: string): void {
    this.requireEditor().setValue(value);
  }

  public getValue(): string {
    return this.requireEditor().getValue();
  }

  public setReadOnly(value: boolean): void {
    this.readOnly = value;
    this.requireEditor().updateOptions({ readOnly: value });
  }

  public setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions): void {
    this.requireEditor().updateOptions(value);
  }

  private requireEditor(): monaco.editor.IStandaloneCodeEditor {
    if (!this.editor) {
      throw new Error("Monaco editor has not been initialized.");
    }

    return this.editor;
  }

  private resolveCode(): string {
    if (this.code !== undefined) {
      return this.code;
    }

    return this.resolveSlottedFile()?.textContent?.trim() ?? "";
  }

  private resolveLanguage(): string {
    if (this.language) {
      return this.language;
    }

    const type = this.resolveSlottedFile()?.getAttribute("type");

    if (!type) {
      return "typescript";
    }

    return type.split("/").pop() ?? "typescript";
  }

  private resolveTheme(): string {
    if (this.theme) {
      return this.theme;
    }

    return this.isDarkMode() ? "vs-dark" : "vs-light";
  }

  private resolveSlottedFile(): Element | undefined {
    return this.children.item(0) ?? undefined;
  }

  private isDarkMode(): boolean {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "code-editor": CodeEditor;
  }
}
