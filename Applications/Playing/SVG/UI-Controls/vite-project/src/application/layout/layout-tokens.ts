import type { IStyleToken } from '@monorepo/core-style-system'

type TokenRecord = Record<string, IStyleToken>

export const APP_LAYOUT_STYLE_TOKENS = {
  'app-shell': {
    name: 'app-shell',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0b1220' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'menu-panel': {
    name: 'menu-panel',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'menu-button': {
    name: 'menu-button',
    extends: ['ui-state-primary'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-hover': {
    name: 'menu-button-hover',
    extends: ['ui-state-primary-hover'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-pressed': {
    name: 'menu-button-pressed',
    extends: ['ui-state-primary-pressed'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-focus-ring': {
    name: 'menu-button-focus-ring',
    extends: ['ui-state-focus'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-disabled': {
    name: 'menu-button-disabled',
    extends: ['ui-state-disabled'],
    style: {
      opacity: 0.38,
    },
  },
  'menu-button-destructive': {
    name: 'menu-button-destructive',
    extends: ['ui-state-destructive'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-destructive-hover': {
    name: 'menu-button-destructive-hover',
    extends: ['ui-state-destructive-hover'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-destructive-pressed': {
    name: 'menu-button-destructive-pressed',
    extends: ['ui-state-destructive-pressed'],
    style: {
      opacity: 1,
    },
  },
  'menu-button-active': {
    name: 'menu-button-active',
    extends: ['line'],
    style: {
      fill: { color: '#0c4a6e' },
      stroke: { color: '#38bdf8', width: 1 },
      opacity: 1,
    },
  },
  'presenter-surface': {
    name: 'presenter-surface',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

export const APP_LAYOUT_CSS_TOKENS = Object.freeze({
  appMaxWidth: '100vw',
  appPadding: 'clamp(8px, 1.6vw, 16px)',
  minHeight: 'calc(100svh - (2 * clamp(8px, 1.6vw, 16px)))',
  menuMinWidth: '220px',
  menuColumn: 'clamp(220px, 24vw, 320px)',
  viewColumn: '1fr',
  templateGridMaxWidth: '960px',
  templateCardMaxWidth: '320px',
})
