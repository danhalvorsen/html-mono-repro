import {
  StyleFactory,
  StyleLibrary,
  StyleResolver,
  TYPOGRAPHY_TOKENS,
  type IStyleToken,
} from "@monorepo/core-style-system";

const CORE_PLOT_STYLE_TOKENS = {
  "canvas-shell": {
    name: "canvas-shell",
    style: {
      fill: { color: "#d9d6ce" },
      opacity: 1,
    },
  },
  "canvas-surface": {
    name: "canvas-surface",
    style: {
      stroke: { color: "rgba(232, 221, 202, 0.16)", width: 1 },
      fill: { color: "#111215" },
      opacity: 1,
    },
  },
  "canvas-grid": {
    name: "canvas-grid",
    style: {
      stroke: { color: "rgba(233, 223, 208, 0.08)", width: 1, dash: [] },
      opacity: 1,
    },
  },
  "canvas-grid-emphasis": {
    name: "canvas-grid-emphasis",
    extends: ["canvas-grid"],
    style: {
      stroke: { color: "rgba(233, 223, 208, 0.18)", width: 1.4, dash: [] },
    },
  },
  "canvas-overlay": {
    name: "canvas-overlay",
    style: {
      fill: { color: "#f59f46" },
      stroke: { color: "#f59f46", width: 2, dash: [8, 6] },
      opacity: 1,
    },
  },
  "panel-surface": {
    name: "panel-surface",
    style: {
      fill: { color: "rgba(255, 255, 255, 0.04)" },
      stroke: { color: "rgba(232, 221, 202, 0.12)", width: 1 },
      opacity: 1,
    },
  },
  "text-primary": {
    name: "text-primary",
    style: {
      fill: { color: "#f6efe0" },
      opacity: 1,
    },
  },
  "text-secondary": {
    name: "text-secondary",
    style: {
      fill: { color: "#d7d0c3" },
      opacity: 1,
    },
  },
  "text-muted": {
    name: "text-muted",
    style: {
      fill: { color: "#b8b2a7" },
      opacity: 1,
    },
  },
  "text-accent": {
    name: "text-accent",
    style: {
      fill: { color: "#c8a97c" },
      opacity: 1,
    },
  },
  "route-active": {
    name: "route-active",
    style: {
      fill: { color: "#f59f46" },
      stroke: { color: "#f59f46", width: 1 },
      opacity: 1,
    },
  },
  "shape-alpha": {
    name: "shape-alpha",
    style: {
      fill: { color: "#be6b2b" },
      stroke: { color: "rgba(255,255,255,0.3)", width: 2 },
      opacity: 1,
    },
  },
  "shape-beta": {
    name: "shape-beta",
    style: {
      fill: { color: "#2c8f78" },
      stroke: { color: "rgba(255,255,255,0.32)", width: 2 },
      opacity: 1,
    },
  },
  "shape-gamma": {
    name: "shape-gamma",
    style: {
      fill: { color: "#6457c5" },
      stroke: { color: "rgba(255,255,255,0.3)", width: 2 },
      opacity: 1,
    },
  },
} as const satisfies Record<string, IStyleToken>;

const styleLibrary = new StyleLibrary(CORE_PLOT_STYLE_TOKENS);
const styleResolver = new StyleResolver([styleLibrary]);
const styleFactory = new StyleFactory(styleResolver);

function resolveColor(token: keyof typeof CORE_PLOT_STYLE_TOKENS): string {
  const style = styleFactory.resolve({ token });
  return style.fill?.color ?? style.stroke?.color ?? "transparent";
}

function resolveStrokeColor(token: keyof typeof CORE_PLOT_STYLE_TOKENS): string {
  const style = styleFactory.resolve({ token });
  return style.stroke?.color ?? "transparent";
}

function resolveStrokeWidth(token: keyof typeof CORE_PLOT_STYLE_TOKENS): number {
  const style = styleFactory.resolve({ token });
  return style.stroke?.width ?? 1;
}

function resolveStrokeDash(token: keyof typeof CORE_PLOT_STYLE_TOKENS): readonly number[] {
  const style = styleFactory.resolve({ token });
  return style.stroke?.dash ?? [];
}

export const CORE_PLOT_THEME = Object.freeze({
  typography: TYPOGRAPHY_TOKENS,
  colors: Object.freeze({
    canvasShell: resolveColor("canvas-shell"),
    canvasSurface: resolveColor("canvas-surface"),
    grid: resolveStrokeColor("canvas-grid"),
    gridEmphasis: resolveStrokeColor("canvas-grid-emphasis"),
    overlay: resolveColor("canvas-overlay"),
    panelSurface: resolveColor("panel-surface"),
    panelBorder: resolveStrokeColor("panel-surface"),
    textPrimary: resolveColor("text-primary"),
    textSecondary: resolveColor("text-secondary"),
    textMuted: resolveColor("text-muted"),
    textAccent: resolveColor("text-accent"),
    routeActive: resolveColor("route-active"),
    routeActiveBorder: resolveStrokeColor("route-active"),
    alphaFill: resolveColor("shape-alpha"),
    alphaStroke: resolveStrokeColor("shape-alpha"),
    betaFill: resolveColor("shape-beta"),
    betaStroke: resolveStrokeColor("shape-beta"),
    gammaFill: resolveColor("shape-gamma"),
    gammaStroke: resolveStrokeColor("shape-gamma"),
  }),
  metrics: Object.freeze({
    gridStrokeWidth: resolveStrokeWidth("canvas-grid"),
    gridEmphasisStrokeWidth: resolveStrokeWidth("canvas-grid-emphasis"),
    overlayStrokeWidth: resolveStrokeWidth("canvas-overlay"),
    overlayDash: resolveStrokeDash("canvas-overlay").join(" "),
  }),
});
