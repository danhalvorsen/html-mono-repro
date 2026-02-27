// src/features/components/Panel/panel-items.ts
import { html, type TemplateResult } from "lit";

// Register elements (side effects)
import "../Panel/Cards/WebCardToggle.js";
import "../Panel/Cards/DummyWebCard1.js";

// Component-owned tag constants (single source of truth)
export const WEB_CARD_TOGGLE_TAG = "mr-web-card-toggle" as const;
export const DUMMY_WEB_CARD_1_TAG = "mr-dummy-web-card-1" as const;

export type PanelItemTag =
  | typeof WEB_CARD_TOGGLE_TAG
  | typeof DUMMY_WEB_CARD_1_TAG;

export type PanelItemRenderer = () => TemplateResult;

export const PANEL_ITEM_RENDERERS: Readonly<Record<PanelItemTag, PanelItemRenderer>> = {
  [WEB_CARD_TOGGLE_TAG]: () => html`<mr-web-card-toggle></mr-web-card-toggle>`,
  [DUMMY_WEB_CARD_1_TAG]: () => html`<mr-dummy-web-card-1></mr-dummy-web-card-1>`,
} as const;