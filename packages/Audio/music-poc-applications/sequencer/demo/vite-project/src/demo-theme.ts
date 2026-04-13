import {
  STYLE_TOKENS,
  StyleFactory,
  StyleLibrary,
  StyleResolver,
  type IStyleToken,
} from "@monorepo/core-style-system";

import { UI_TOKENS } from "../../../../../core.sequencer.ui.resources/src/ui-tokens.ts";

const DEMO_APP_TOKENS = {
  "demo-root": {
    name: "demo-root",
    extends: ["knob-button-body-off"],
    style: {
      fill: { color: "#16171d" },
    },
  },
  "demo-shell": {
    name: "demo-shell",
    extends: ["tone-label-background"],
    style: {
      fill: { color: "#121620" },
      stroke: { color: "#2f3c56", width: 1 },
    },
  },
  "demo-panel": {
    name: "demo-panel",
    extends: ["knob-button-body-off"],
    style: {
      fill: { color: "#0f1420" },
      stroke: { color: "#2f3c56", width: 1 },
    },
  },
  "demo-field": {
    name: "demo-field",
    extends: ["knob-button-body-off"],
    style: {
      fill: { color: "#0f1420" },
      stroke: { color: "#3f4f70", width: 1 },
    },
  },
  "demo-table": {
    name: "demo-table",
    extends: ["knob-button-body-on"],
    style: {
      fill: { color: "#0b1018" },
      stroke: { color: "#2c3851", width: 1 },
    },
  },
  "demo-table-head": {
    name: "demo-table-head",
    extends: ["surface"],
    style: {
      fill: { color: "#111b2e" },
    },
  },
  "demo-row-active": {
    name: "demo-row-active",
    extends: ["surface"],
    style: {
      fill: { color: "#2c3f6d" },
    },
  },
  "demo-note": {
    name: "demo-note",
    extends: ["knob-button-body-off"],
    style: {
      fill: { color: "#131b2a" },
      stroke: { color: "#34435f", width: 1 },
    },
  },
  "demo-note-active": {
    name: "demo-note-active",
    extends: ["shift-button-face"],
    style: {
      fill: { color: "#ffd166" },
      stroke: { color: "#ffbe3d", width: 1 },
    },
  },
  "demo-button": {
    name: "demo-button",
    extends: ["line"],
    style: {
      fill: { color: "#3453a5" },
      stroke: { color: "#6c86c9", width: 1 },
    },
  },
  "demo-error": {
    name: "demo-error",
    extends: ["digit-button-text-off"],
    style: {
      fill: { color: "#ff8d8d" },
    },
  },
  "demo-text": {
    name: "demo-text",
    extends: ["tone-label-text"],
    style: {
      fill: { color: "#e8ecf4" },
    },
  },
  "demo-text-muted": {
    name: "demo-text-muted",
    extends: ["digit-button-text-off"],
    style: {
      fill: { color: "#aab7d3" },
    },
  },
  "demo-text-strong": {
    name: "demo-text-strong",
    extends: ["digit-button-text"],
    style: {
      fill: { color: "#d8e0f2" },
    },
  },
  "demo-text-state": {
    name: "demo-text-state",
    extends: ["digit-button-text"],
    style: {
      fill: { color: "#9fb4e2" },
    },
  },
  "demo-text-bright": {
    name: "demo-text-bright",
    extends: ["tone-label-text"],
    style: {
      fill: { color: "#f5f7ff" },
    },
  },
  "demo-text-row": {
    name: "demo-text-row",
    extends: ["digit-button-text"],
    style: {
      fill: { color: "#c5d0e6" },
    },
  },
} as const satisfies Record<string, IStyleToken>;

const styleFactory = new StyleFactory(
  new StyleResolver([
    new StyleLibrary(STYLE_TOKENS),
    new StyleLibrary(UI_TOKENS),
    new StyleLibrary(DEMO_APP_TOKENS),
  ]),
);

function resolveColor(token: string, channel: "fill" | "stroke", fallback: string): string {
  const style = styleFactory.resolve({ token });
  return style[channel]?.color ?? fallback;
}

export const demoTheme = Object.freeze({
  rootBg: resolveColor("demo-root", "fill", "#16171d"),
  shellBg: resolveColor("demo-shell", "fill", "#121620"),
  shellBorder: resolveColor("demo-shell", "stroke", "#2f3c56"),
  panelBg: resolveColor("demo-panel", "fill", "#0f1420"),
  panelBorder: resolveColor("demo-panel", "stroke", "#2f3c56"),
  fieldBg: resolveColor("demo-field", "fill", "#0f1420"),
  fieldBorder: resolveColor("demo-field", "stroke", "#3f4f70"),
  tableBg: resolveColor("demo-table", "fill", "#0b1018"),
  tableBorder: resolveColor("demo-table", "stroke", "#2c3851"),
  tableHeadBg: resolveColor("demo-table-head", "fill", "#111b2e"),
  rowActiveBg: resolveColor("demo-row-active", "fill", "#2c3f6d"),
  noteBg: resolveColor("demo-note", "fill", "#131b2a"),
  noteBorder: resolveColor("demo-note", "stroke", "#34435f"),
  noteActiveBg: resolveColor("demo-note-active", "fill", "#ffd166"),
  noteActiveBorder: resolveColor("demo-note-active", "stroke", "#ffbe3d"),
  buttonBg: resolveColor("demo-button", "fill", "#3453a5"),
  buttonBorder: resolveColor("demo-button", "stroke", "#6c86c9"),
  errorText: resolveColor("demo-error", "fill", "#ff8d8d"),
  text: resolveColor("demo-text", "fill", "#e8ecf4"),
  textMuted: resolveColor("demo-text-muted", "fill", "#aab7d3"),
  textStrong: resolveColor("demo-text-strong", "fill", "#d8e0f2"),
  textState: resolveColor("demo-text-state", "fill", "#9fb4e2"),
  textBright: resolveColor("demo-text-bright", "fill", "#f5f7ff"),
  textRow: resolveColor("demo-text-row", "fill", "#c5d0e6"),
});

const DEMO_GLOBAL_STYLE_ID = "demo-theme-global-styles";

function installDemoGlobalStyles(doc: Document): void {
  if (doc.getElementById(DEMO_GLOBAL_STYLE_ID) !== null) {
    return;
  }

  const style = doc.createElement("style");
  style.id = DEMO_GLOBAL_STYLE_ID;
  style.textContent = `
    html,
    body {
      margin: 0;
      min-height: 100%;
      background: var(--demo-root-bg);
      color: var(--demo-text);
    }

    body {
      font-family: Arial, sans-serif;
    }

    .preview-system {
      display: grid;
      gap: 12px;
      padding: 12px;
      background: var(--demo-panel-bg);
      border-bottom: 1px solid var(--demo-panel-border);
    }

    .preview-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .preview-title {
      flex: 0 0 auto;
    }

    .preview-separator {
      color: var(--demo-text-bright);
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
    }
  `;
  doc.head.append(style);
}

export function applyDemoTheme(target: HTMLElement = document.documentElement): void {
  target.style.setProperty("--demo-root-bg", demoTheme.rootBg);
  target.style.setProperty("--demo-shell-bg", demoTheme.shellBg);
  target.style.setProperty("--demo-shell-border", demoTheme.shellBorder);
  target.style.setProperty("--demo-panel-bg", demoTheme.panelBg);
  target.style.setProperty("--demo-panel-border", demoTheme.panelBorder);
  target.style.setProperty("--demo-field-bg", demoTheme.fieldBg);
  target.style.setProperty("--demo-field-border", demoTheme.fieldBorder);
  target.style.setProperty("--demo-table-bg", demoTheme.tableBg);
  target.style.setProperty("--demo-table-border", demoTheme.tableBorder);
  target.style.setProperty("--demo-table-head-bg", demoTheme.tableHeadBg);
  target.style.setProperty("--demo-row-active-bg", demoTheme.rowActiveBg);
  target.style.setProperty("--demo-note-bg", demoTheme.noteBg);
  target.style.setProperty("--demo-note-border", demoTheme.noteBorder);
  target.style.setProperty("--demo-note-active-bg", demoTheme.noteActiveBg);
  target.style.setProperty("--demo-note-active-border", demoTheme.noteActiveBorder);
  target.style.setProperty("--demo-button-bg", demoTheme.buttonBg);
  target.style.setProperty("--demo-button-border", demoTheme.buttonBorder);
  target.style.setProperty("--demo-error-text", demoTheme.errorText);
  target.style.setProperty("--demo-text", demoTheme.text);
  target.style.setProperty("--demo-text-muted", demoTheme.textMuted);
  target.style.setProperty("--demo-text-strong", demoTheme.textStrong);
  target.style.setProperty("--demo-text-state", demoTheme.textState);
  target.style.setProperty("--demo-text-bright", demoTheme.textBright);
  target.style.setProperty("--demo-text-row", demoTheme.textRow);
}

if (typeof document !== "undefined") {
  applyDemoTheme();
  installDemoGlobalStyles(document);
}
