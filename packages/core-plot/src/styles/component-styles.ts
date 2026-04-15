import { css, unsafeCSS, type CSSResultGroup } from "lit";

import { CORE_PLOT_THEME } from "./core-plot-style-system.js";

const fontUi = unsafeCSS(CORE_PLOT_THEME.typography.fontFamily.ui);
const colorCanvasShell = unsafeCSS(CORE_PLOT_THEME.colors.canvasShell);
const colorCanvasSurface = unsafeCSS(CORE_PLOT_THEME.colors.canvasSurface);
const colorPanelSurface = unsafeCSS(CORE_PLOT_THEME.colors.panelSurface);
const colorPanelBorder = unsafeCSS(CORE_PLOT_THEME.colors.panelBorder);
const colorTextPrimary = unsafeCSS(CORE_PLOT_THEME.colors.textPrimary);
const colorTextSecondary = unsafeCSS(CORE_PLOT_THEME.colors.textSecondary);
const colorTextMuted = unsafeCSS(CORE_PLOT_THEME.colors.textMuted);
const colorTextAccent = unsafeCSS(CORE_PLOT_THEME.colors.textAccent);
const colorRouteActive = unsafeCSS(CORE_PLOT_THEME.colors.routeActive);
const colorRouteActiveBorder = unsafeCSS(CORE_PLOT_THEME.colors.routeActiveBorder);
const colorOverlay = unsafeCSS(CORE_PLOT_THEME.colors.overlay);
const colorGrid = unsafeCSS(CORE_PLOT_THEME.colors.grid);
const gridStrokeWidth = unsafeCSS(String(CORE_PLOT_THEME.metrics.gridStrokeWidth));
const overlayStrokeWidth = unsafeCSS(String(CORE_PLOT_THEME.metrics.overlayStrokeWidth));
const overlayDash = unsafeCSS(CORE_PLOT_THEME.metrics.overlayDash);

export const PLOT_CANVAS_STYLES: CSSResultGroup = css`
  :host {
    display: block;
    color: ${colorCanvasShell};
  }

  .shell {
    display: grid;
    gap: 18px;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 22px;
    background: ${colorCanvasSurface};
    border: 1px solid ${colorPanelBorder};
    touch-action: none;
  }

  [data-role='grid'] line {
    stroke: ${colorGrid};
    stroke-width: ${gridStrokeWidth};
  }

  .overlay text {
    fill: ${colorCanvasShell};
    font: 12px/1.2 ${fontUi};
  }

  .panel {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    font: 12px/1.4 ${fontUi};
  }

  .stat {
    padding: 12px 14px;
    border-radius: 14px;
    background: ${colorPanelSurface};
    border: 1px solid ${colorPanelBorder};
  }

  .label {
    display: block;
    color: ${colorTextMuted};
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .value {
    color: ${colorTextPrimary};
  }
`;

export const DEMO_SHELL_VIEW_STYLES: CSSResultGroup = css`
  :host {
    display: block;
    min-height: 100svh;
    color: ${colorTextPrimary};
    background: ${colorCanvasSurface};
  }

  .app-shell {
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 32px 40px;
    display: grid;
    gap: 24px;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    border-radius: 20px;
    background: ${colorPanelSurface};
    border: 1px solid ${colorPanelBorder};
  }

  .brand {
    display: grid;
    gap: 4px;
  }

  .eyebrow {
    font: 12px/1.2 ${fontUi};
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: ${colorTextAccent};
  }

  .title {
    font: 600 20px/1 ${fontUi};
    color: ${colorTextPrimary};
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  a {
    padding: 10px 14px;
    border-radius: 999px;
    text-decoration: none;
    font: 13px/1 ${fontUi};
    color: ${colorTextSecondary};
    border: 1px solid ${colorPanelBorder};
    background: ${colorPanelSurface};
  }

  a[data-active="true"] {
    color: ${colorCanvasSurface};
    background: ${colorRouteActive};
    border-color: ${colorRouteActiveBorder};
  }

  @media (max-width: 760px) {
    .topbar {
      align-items: start;
      flex-direction: column;
    }
  }
`;

export const SPRINT_ONE_VIEW_STYLES: CSSResultGroup = css`
  :host {
    display: block;
  }

  .page {
    display: grid;
    gap: 26px;
  }

  .hero {
    display: grid;
    gap: 10px;
    align-items: start;
  }

  .eyebrow {
    font: 12px/1.2 ${fontUi};
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: ${colorTextAccent};
  }

  h1 {
    margin: 0;
    font: 600 52px/0.94 ${fontUi};
    letter-spacing: -0.05em;
    max-width: 12ch;
    color: ${colorTextPrimary};
  }

  p {
    margin: 0;
    max-width: 66ch;
    color: ${colorTextMuted};
    font: 16px/1.6 ${fontUi};
  }

  .notes {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .note {
    padding: 16px 18px;
    border-radius: 18px;
    background: ${colorPanelSurface};
    border: 1px solid ${colorPanelBorder};
    font: 13px/1.5 ${fontUi};
    color: ${colorTextSecondary};
  }

  @media (max-width: 900px) {
    .notes {
      grid-template-columns: 1fr;
    }
  }
`;

export const SPRINT_PANEL_VIEW_STYLES: CSSResultGroup = css`
  :host {
    display: block;
  }

  .page {
    display: grid;
    gap: 18px;
  }

  .panel {
    padding: 28px;
    border-radius: 26px;
    background: ${colorPanelSurface};
    border: 1px solid ${colorPanelBorder};
  }

  .hero {
    display: grid;
    gap: 10px;
  }

  .eyebrow {
    font: 12px/1.2 ${fontUi};
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: ${colorTextAccent};
  }

  h1,
  h2 {
    margin: 0;
    color: ${colorTextPrimary};
    font-family: ${fontUi};
    letter-spacing: -0.04em;
  }

  h1 {
    font-size: 52px;
    line-height: 0.94;
  }

  h2 {
    font-size: 22px;
    line-height: 1.1;
  }

  p,
  li {
    margin: 0;
    color: ${colorTextMuted};
    font: 16px/1.6 ${fontUi};
  }

  ul {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 10px;
  }
`;

export const SPRINT_THREE_VIEW_STYLES: CSSResultGroup = css`
  ${SPRINT_PANEL_VIEW_STYLES}

  .grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 18px;
  }

  .notes {
    display: grid;
    gap: 12px;
    padding-left: 18px;
  }

  .legend {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .chip {
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid ${colorPanelBorder};
    background: ${colorPanelSurface};
    color: ${colorTextSecondary};
    font: 13px/1.5 ${fontUi};
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 20px;
    background: ${colorCanvasSurface};
    border: 1px solid ${colorPanelBorder};
  }

  .caption {
    margin-top: 12px;
    color: ${colorTextSecondary};
    font: 13px/1.5 ${fontUi};
  }

  @media (max-width: 980px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .legend {
      grid-template-columns: 1fr;
    }
  }
`;

export const AXIS_INTERVAL_DEMO_STYLES: CSSResultGroup = css`
  :host {
    display: block;
  }

  .panel {
    padding: 22px 24px;
    border-radius: 22px;
    background: ${colorPanelSurface};
    border: 1px solid ${colorPanelBorder};
  }

  .meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
    color: ${colorTextSecondary};
    font: 13px/1.5 ${fontUi};
  }

  .range {
    color: ${colorRouteActive};
    font-weight: 600;
  }
`;

export const CANVAS_OVERLAY_ATTRS = Object.freeze({
  overlayFill: CORE_PLOT_THEME.colors.overlay,
  overlayStroke: CORE_PLOT_THEME.colors.overlay,
  overlayStrokeWidth: CORE_PLOT_THEME.metrics.overlayStrokeWidth,
  overlayDash: CORE_PLOT_THEME.metrics.overlayDash,
  gridStroke: CORE_PLOT_THEME.colors.grid,
});

