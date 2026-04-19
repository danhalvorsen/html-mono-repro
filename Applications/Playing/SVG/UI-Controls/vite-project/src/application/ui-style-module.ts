import { css } from 'lit'
import {
  STYLE_TOKENS,
  TYPOGRAPHY_TOKENS,
  StyleFactory,
  StyleLibrary,
  StyleResolver,
  type IStyleToken,
} from '@monorepo/core-style-system'
import {
  APP_LAYOUT_CSS_TOKENS,
  APP_LAYOUT_STYLE_TOKENS,
} from './layout/layout-tokens.js'

type TokenRecord = Record<string, IStyleToken>

const SHARED_UI_TOKENS = {
  'ui-shared-body': {
    name: 'ui-shared-body',
    extends: ['surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'ui-shared-surface': {
    name: 'ui-shared-surface',
    extends: ['surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'ui-shared-text-primary': {
    name: 'ui-shared-text-primary',
    extends: ['base'],
    style: {
      fill: { color: '#e5e7eb' },
      opacity: 1,
    },
  },
  'ui-shared-text-muted': {
    name: 'ui-shared-text-muted',
    extends: ['base'],
    style: {
      fill: { color: '#cbd5e1' },
      opacity: 1,
    },
  },
  'ui-shared-text-bright': {
    name: 'ui-shared-text-bright',
    extends: ['base'],
    style: {
      fill: { color: '#f8fafc' },
      opacity: 1,
    },
  },
  'ui-shared-button': {
    name: 'ui-shared-button',
    extends: ['surface'],
    style: {
      fill: { color: '#111827' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'ui-shared-button-text': {
    name: 'ui-shared-button-text',
    extends: ['base'],
    style: {
      fill: { color: '#f8fafc' },
      opacity: 1,
    },
  },
  'ui-shared-button-text-disabled': {
    name: 'ui-shared-button-text-disabled',
    extends: ['base'],
    style: {
      fill: { color: '#cbd5e1' },
      opacity: 1,
    },
  },
  'ui-state-primary': {
    name: 'ui-state-primary',
    extends: ['surface'],
    style: {
      fill: { color: '#1d4ed8' },
      stroke: { color: '#1e40af', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-primary-hover': {
    name: 'ui-state-primary-hover',
    extends: ['ui-state-primary'],
    style: {
      fill: { color: '#2563eb' },
      stroke: { color: '#1d4ed8', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-primary-pressed': {
    name: 'ui-state-primary-pressed',
    extends: ['ui-state-primary'],
    style: {
      fill: { color: '#1e3a8a' },
      stroke: { color: '#1e3a8a', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-focus': {
    name: 'ui-state-focus',
    extends: ['line'],
    style: {
      stroke: { color: '#93c5fd', width: 2 },
      opacity: 1,
    },
  },
  'ui-state-disabled': {
    name: 'ui-state-disabled',
    extends: ['ui-state-primary'],
    style: {
      fill: { color: '#1d4ed8' },
      stroke: { color: '#1e40af', width: 1 },
      opacity: 0.38,
    },
  },
  'ui-state-destructive': {
    name: 'ui-state-destructive',
    extends: ['surface'],
    style: {
      fill: { color: '#dc2626' },
      stroke: { color: '#991b1b', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-destructive-hover': {
    name: 'ui-state-destructive-hover',
    extends: ['ui-state-destructive'],
    style: {
      fill: { color: '#ef4444' },
      stroke: { color: '#b91c1c', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-destructive-pressed': {
    name: 'ui-state-destructive-pressed',
    extends: ['ui-state-destructive'],
    style: {
      fill: { color: '#b91c1c' },
      stroke: { color: '#7f1d1d', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-error': {
    name: 'ui-state-error',
    extends: ['surface'],
    style: {
      fill: { color: '#ef4444' },
      stroke: { color: '#991b1b', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-warning': {
    name: 'ui-state-warning',
    extends: ['surface'],
    style: {
      fill: { color: '#f59e0b' },
      stroke: { color: '#b45309', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-info': {
    name: 'ui-state-info',
    extends: ['surface'],
    style: {
      fill: { color: '#0ea5e9' },
      stroke: { color: '#0369a1', width: 1 },
      opacity: 1,
    },
  },
  'ui-state-success': {
    name: 'ui-state-success',
    extends: ['surface'],
    style: {
      fill: { color: '#16a34a' },
      stroke: { color: '#166534', width: 1 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const TEMPLATE_HOST_TOKENS = {
  'template-frame': {
    name: 'template-frame',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const DUAL_SECTOR_SHAPE_TOKENS = {
  'dual-sector-fill': {
    name: 'dual-sector-fill',
    extends: ['circle-primary'],
    style: {
      fill: { color: '#1d9bf0' },
      opacity: 1,
    },
  },
  'dual-sector-stroke': {
    name: 'dual-sector-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0b5a8f', width: 1 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const CIRCLE_SHAPE_TOKENS = {
  'circle-shape-fill': {
    name: 'circle-shape-fill',
    extends: ['circle-primary'],
    style: {
      fill: { color: '#1d9bf0' },
      opacity: 1,
    },
  },
  'circle-shape-stroke': {
    name: 'circle-shape-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0b5a8f', width: 1.5 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const RECTANGLE_SHAPE_TOKENS = {
  'rectangle-shape-fill': {
    name: 'rectangle-shape-fill',
    extends: ['circle-primary'],
    style: {
      fill: { color: '#1d9bf0' },
      opacity: 1,
    },
  },
  'rectangle-shape-stroke': {
    name: 'rectangle-shape-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0b5a8f', width: 1.5 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const TRIANGLE_SHAPE_TOKENS = {
  'triangle-shape-fill': {
    name: 'triangle-shape-fill',
    extends: ['circle-primary'],
    style: {
      fill: { color: '#1d9bf0' },
      opacity: 1,
    },
  },
  'triangle-shape-stroke': {
    name: 'triangle-shape-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0b5a8f', width: 1.5 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const LINE_SHAPE_TOKENS = {
  'line-shape-stroke': {
    name: 'line-shape-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#38bdf8', width: 2 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const KNOB_SHAPE_TOKENS = {
  'knob-face-fill': {
    name: 'knob-face-fill',
    extends: ['surface'],
    style: {
      fill: { color: '#1f2937' },
      opacity: 1,
    },
  },
  'knob-face-stroke': {
    name: 'knob-face-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0f172a', width: 1.5 },
      opacity: 1,
    },
  },
  'knob-indicator-stroke': {
    name: 'knob-indicator-stroke',
    extends: ['line'],
    style: {
      stroke: { color: '#e5e7eb', width: 3 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const TRIANGLE_KNOB_TOKENS = {
  'triangle-knob-face-fill': {
    name: 'triangle-knob-face-fill',
    extends: ['surface'],
    style: {
      fill: { color: '#1f2937' },
      opacity: 1,
    },
  },
  'triangle-knob-face-stroke': {
    name: 'triangle-knob-face-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0f172a', width: 1.5 },
      opacity: 1,
    },
  },
  'triangle-knob-indicator-fill': {
    name: 'triangle-knob-indicator-fill',
    extends: ['ui-state-warning'],
    style: {
      opacity: 1,
    },
  },
  'triangle-knob-indicator-stroke': {
    name: 'triangle-knob-indicator-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#7c2d12', width: 1.2 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const DISTRBUTED_DISTRIBUTION_TOKENS = {
  'distribution-path': {
    name: 'distribution-path',
    extends: ['axis'],
    style: {
      stroke: { color: '#38bdf8', width: 1.5 },
      opacity: 1,
    },
  },
  'distribution-source-fill': {
    name: 'distribution-source-fill',
    extends: ['circle-primary'],
    style: {
      fill: { color: '#1d9bf0' },
      opacity: 0.96,
    },
  },
  'distribution-source-stroke': {
    name: 'distribution-source-stroke',
    extends: ['axis'],
    style: {
      stroke: { color: '#0b5a8f', width: 1.2 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const CIRCLE_LABEL_DISTRIBUTION_TOKENS = {
  'circle-label-guide': {
    name: 'circle-label-guide',
    extends: ['axis'],
    style: {
      stroke: { color: '#38bdf8', width: 1.5 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const LABEL_FEATURE_TOKENS = {
  'label-feature-fill-default': {
    name: 'label-feature-fill-default',
    extends: ['ui-state-primary'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-default': {
    name: 'label-feature-stroke-default',
    extends: ['ui-state-primary'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-default': {
    name: 'label-feature-text-default',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#f8fafc' },
      opacity: 1,
    },
  },
  'label-feature-fill-active': {
    name: 'label-feature-fill-active',
    extends: ['ui-state-primary-hover'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-active': {
    name: 'label-feature-stroke-active',
    extends: ['ui-state-primary-hover'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-active': {
    name: 'label-feature-text-active',
    extends: ['label-feature-text-default'],
    style: {
      fill: { color: '#ffffff' },
      opacity: 1,
    },
  },
  'label-feature-fill-error': {
    name: 'label-feature-fill-error',
    extends: ['ui-state-error'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-error': {
    name: 'label-feature-stroke-error',
    extends: ['ui-state-error'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-error': {
    name: 'label-feature-text-error',
    extends: ['label-feature-text-default'],
    style: {
      fill: { color: '#ffffff' },
      opacity: 1,
    },
  },
  'label-feature-fill-success': {
    name: 'label-feature-fill-success',
    extends: ['ui-state-success'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-success': {
    name: 'label-feature-stroke-success',
    extends: ['ui-state-success'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-success': {
    name: 'label-feature-text-success',
    extends: ['label-feature-text-default'],
    style: {
      fill: { color: '#ffffff' },
      opacity: 1,
    },
  },
  'label-feature-fill-disabled': {
    name: 'label-feature-fill-disabled',
    extends: ['ui-state-disabled'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-disabled': {
    name: 'label-feature-stroke-disabled',
    extends: ['ui-state-disabled'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-disabled': {
    name: 'label-feature-text-disabled',
    extends: ['label-feature-text-default'],
    style: {
      fill: { color: '#cbd5e1' },
      opacity: 1,
    },
  },
  'label-feature-fill-warning': {
    name: 'label-feature-fill-warning',
    extends: ['ui-state-warning'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-warning': {
    name: 'label-feature-stroke-warning',
    extends: ['ui-state-warning'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-warning': {
    name: 'label-feature-text-warning',
    extends: ['label-feature-text-default'],
    style: {
      fill: { color: '#111827' },
      opacity: 1,
    },
  },
  'label-feature-fill-info': {
    name: 'label-feature-fill-info',
    extends: ['ui-state-info'],
    style: {
      opacity: 1,
    },
  },
  'label-feature-stroke-info': {
    name: 'label-feature-stroke-info',
    extends: ['ui-state-info'],
    style: {
      stroke: { width: 1.2 },
      opacity: 1,
    },
  },
  'label-feature-text-info': {
    name: 'label-feature-text-info',
    extends: ['label-feature-text-default'],
    style: {
      fill: { color: '#ffffff' },
      opacity: 1,
    },
  },
  'label-feature-title-default': {
    name: 'label-feature-title-default',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#f8fafc' },
      opacity: 1,
    },
  },
  'label-feature-title-active': {
    name: 'label-feature-title-active',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#dbeafe' },
      opacity: 1,
    },
  },
  'label-feature-title-error': {
    name: 'label-feature-title-error',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#fecaca' },
      opacity: 1,
    },
  },
  'label-feature-title-success': {
    name: 'label-feature-title-success',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#bbf7d0' },
      opacity: 1,
    },
  },
  'label-feature-title-warning': {
    name: 'label-feature-title-warning',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#fde68a' },
      opacity: 1,
    },
  },
  'label-feature-title-info': {
    name: 'label-feature-title-info',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#bae6fd' },
      opacity: 1,
    },
  },
  'label-feature-title-disabled': {
    name: 'label-feature-title-disabled',
    extends: ['ui-shared-text-muted'],
    style: {
      fill: { color: '#cbd5e1' },
      opacity: 0.7,
    },
  },
} as const satisfies TokenRecord

const PROPERTY_PANEL_TOKENS = {
  'property-panel-surface': {
    name: 'property-panel-surface',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'property-panel-type': {
    name: 'property-panel-type',
    extends: ['line'],
    style: {
      fill: { color: '#0c4a6e' },
      stroke: { color: '#38bdf8', width: 1 },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

const WEB_CARD_TOKENS = {
  'web-card-surface': {
    name: 'web-card-surface',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0b1220' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'web-card-header': {
    name: 'web-card-header',
    extends: ['ui-state-info'],
    style: {
      opacity: 1,
    },
  },
  'web-card-main': {
    name: 'web-card-main',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#0f172a' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'web-card-footer': {
    name: 'web-card-footer',
    extends: ['ui-shared-surface'],
    style: {
      fill: { color: '#111827' },
      stroke: { color: '#334155', width: 1 },
      opacity: 1,
    },
  },
  'web-card-header-text': {
    name: 'web-card-header-text',
    extends: ['ui-shared-text-bright'],
    style: {
      fill: { color: '#f8fafc' },
      opacity: 1,
    },
  },
  'web-card-footer-text': {
    name: 'web-card-footer-text',
    extends: ['ui-shared-text-muted'],
    style: {
      fill: { color: '#cbd5e1' },
      opacity: 1,
    },
  },
} as const satisfies TokenRecord

function createStyleFactory(componentTokens: TokenRecord): StyleFactory {
  return new StyleFactory(
    new StyleResolver([
      new StyleLibrary(STYLE_TOKENS),
      new StyleLibrary(SHARED_UI_TOKENS),
      new StyleLibrary(componentTokens),
    ]),
  )
}

function resolveFill(
  styleFactory: StyleFactory,
  token: string,
  fallback: string,
): string {
  return styleFactory.resolve({ token }).fill?.color ?? fallback
}

function resolveStroke(
  styleFactory: StyleFactory,
  token: string,
  fallback: string,
): string {
  return styleFactory.resolve({ token }).stroke?.color ?? fallback
}

function resolveStrokeWidth(
  styleFactory: StyleFactory,
  token: string,
  fallback: number,
): number {
  return styleFactory.resolve({ token }).stroke?.width ?? fallback
}

const sharedStyleFactory = createStyleFactory({})
const appLayoutStyleFactory = createStyleFactory(APP_LAYOUT_STYLE_TOKENS)
const templateHostStyleFactory = createStyleFactory(TEMPLATE_HOST_TOKENS)
const dualSectorShapeStyleFactory = createStyleFactory(DUAL_SECTOR_SHAPE_TOKENS)
const circleShapeStyleFactory = createStyleFactory(CIRCLE_SHAPE_TOKENS)
const rectangleShapeStyleFactory = createStyleFactory(RECTANGLE_SHAPE_TOKENS)
const triangleShapeStyleFactory = createStyleFactory(TRIANGLE_SHAPE_TOKENS)
const lineShapeStyleFactory = createStyleFactory(LINE_SHAPE_TOKENS)
const knobShapeStyleFactory = createStyleFactory(KNOB_SHAPE_TOKENS)
const triangleKnobStyleFactory = createStyleFactory(TRIANGLE_KNOB_TOKENS)
const distrbutedDistributionStyleFactory = createStyleFactory(
  DISTRBUTED_DISTRIBUTION_TOKENS,
)
const circleLabelDistributionStyleFactory = createStyleFactory(
  CIRCLE_LABEL_DISTRIBUTION_TOKENS,
)
const labelFeatureStyleFactory = createStyleFactory(LABEL_FEATURE_TOKENS)
const propertyPanelStyleFactory = createStyleFactory(PROPERTY_PANEL_TOKENS)
const webCardStyleFactory = createStyleFactory(WEB_CARD_TOKENS)

export const sharedTheme = Object.freeze({
  fontUi: TYPOGRAPHY_TOKENS.fontFamily.ui,
  bodyBackground: resolveFill(sharedStyleFactory, 'ui-shared-body', '#0f172a'),
  textPrimary: resolveFill(
    sharedStyleFactory,
    'ui-shared-text-primary',
    '#e5e7eb',
  ),
  textMuted: resolveFill(sharedStyleFactory, 'ui-shared-text-muted', '#cbd5e1'),
  textBright: resolveFill(
    sharedStyleFactory,
    'ui-shared-text-bright',
    '#f8fafc',
  ),
  spacingSm: '8px',
  spacingMd: '16px',
  spacingLg: '20px',
  radiusSm: '8px',
  radiusMd: '14px',
  buttonFontSize: '14px',
  headingFontSize: '18px',
})

export const appTheme = Object.freeze({
  shellBackground: resolveFill(appLayoutStyleFactory, 'app-shell', '#0b1220'),
  shellBorder: resolveStroke(appLayoutStyleFactory, 'app-shell', '#334155'),
  panelShadow: 'rgba(2, 6, 23, 0.45) 0 16px 30px -16px',
})

export const globalDesignTokens = Object.freeze({
  colors: {
    bg: '#0f172a',
    fg: '#e5e7eb',
    accent: '#38bdf8',
    warning: '#f59e0b',
    clip: '#8b5cf6',
    active: '#0ea5e9',
    inactive: '#334155',
    ledActive: '#22c55e',
    ledInactive: '#14532d',
  },
  sizes: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    none: '0px',
    sm: '8px',
    md: '14px',
    lg: '20px',
    full: '9999px',
  },
  typography: {
    ui: TYPOGRAPHY_TOKENS.fontFamily.ui,
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    sizeXs: '11px',
    sizeSm: '13px',
    sizeMd: '14px',
    sizeLg: '18px',
  },
  effects: {
    shadowSoft: 'rgba(2, 6, 23, 0.45) 0 16px 30px -16px',
    shadowHard: 'rgba(2, 6, 23, 0.7) 0 10px 0 0',
    glowAccent: '0 0 10px rgba(56, 189, 248, 0.65)',
    glowWarning: '0 0 10px rgba(245, 158, 11, 0.65)',
    glowLed: '0 0 8px rgba(34, 197, 94, 0.75)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  stroke: {
    thin: '1px',
    normal: '2px',
    bold: '3px',
  },
})

export const viewMenuTheme = Object.freeze({
  panelBackground: resolveFill(appLayoutStyleFactory, 'menu-panel', '#0f172a'),
  panelBorder: resolveStroke(appLayoutStyleFactory, 'menu-panel', '#334155'),
  buttonBackground: resolveFill(appLayoutStyleFactory, 'menu-button', '#111827'),
  buttonBorder: resolveStroke(appLayoutStyleFactory, 'menu-button', '#334155'),
  buttonText: resolveFill(sharedStyleFactory, 'ui-shared-button-text', '#f8fafc'),
  buttonHoverBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-hover',
    '#2563eb',
  ),
  buttonHoverBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-hover',
    '#1d4ed8',
  ),
  buttonPressedBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-pressed',
    '#1e3a8a',
  ),
  buttonPressedBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-pressed',
    '#1e3a8a',
  ),
  buttonFocusRing: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-focus-ring',
    '#93c5fd',
  ),
  buttonDisabledBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-disabled',
    '#1d4ed8',
  ),
  buttonDisabledBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-disabled',
    '#1e40af',
  ),
  buttonDisabledText: resolveFill(
    sharedStyleFactory,
    'ui-shared-button-text-disabled',
    '#cbd5e1',
  ),
  buttonDisabledOpacity: appLayoutStyleFactory
    .resolve({ token: 'menu-button-disabled' })
    .opacity?.toString() ?? '0.38',
  buttonDestructiveBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-destructive',
    '#dc2626',
  ),
  buttonDestructiveBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-destructive',
    '#991b1b',
  ),
  buttonDestructiveHoverBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-destructive-hover',
    '#ef4444',
  ),
  buttonDestructiveHoverBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-destructive-hover',
    '#b91c1c',
  ),
  buttonDestructivePressedBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-destructive-pressed',
    '#b91c1c',
  ),
  buttonDestructivePressedBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-destructive-pressed',
    '#7f1d1d',
  ),
  buttonActiveBackground: resolveFill(
    appLayoutStyleFactory,
    'menu-button-active',
    '#0c4a6e',
  ),
  buttonActiveBorder: resolveStroke(
    appLayoutStyleFactory,
    'menu-button-active',
    '#38bdf8',
  ),
})

export const currentViewPresenterTheme = Object.freeze({
  surfaceBackground: resolveFill(
    appLayoutStyleFactory,
    'presenter-surface',
    '#0f172a',
  ),
  surfaceBorder: resolveStroke(
    appLayoutStyleFactory,
    'presenter-surface',
    '#334155',
  ),
})

export const templateHostTheme = Object.freeze({
  frameBackground: resolveFill(
    templateHostStyleFactory,
    'template-frame',
    '#0f172a',
  ),
  frameBorder: resolveStroke(templateHostStyleFactory, 'template-frame', '#334155'),
  frameMinWidth: '220px',
  frameMinHeight: '120px',
})

export const dualSectorShapeTheme = Object.freeze({
  fill: resolveFill(dualSectorShapeStyleFactory, 'dual-sector-fill', '#1d9bf0'),
  stroke: resolveStroke(dualSectorShapeStyleFactory, 'dual-sector-stroke', '#0b5a8f'),
  strokeWidth: resolveStrokeWidth(
    dualSectorShapeStyleFactory,
    'dual-sector-stroke',
    1,
  ),
})

export const circleShapeTheme = Object.freeze({
  fill: resolveFill(circleShapeStyleFactory, 'circle-shape-fill', '#1d9bf0'),
  stroke: resolveStroke(circleShapeStyleFactory, 'circle-shape-stroke', '#0b5a8f'),
  strokeWidth: resolveStrokeWidth(circleShapeStyleFactory, 'circle-shape-stroke', 1.5),
})

export const rectangleShapeTheme = Object.freeze({
  fill: resolveFill(
    rectangleShapeStyleFactory,
    'rectangle-shape-fill',
    '#1d9bf0',
  ),
  stroke: resolveStroke(
    rectangleShapeStyleFactory,
    'rectangle-shape-stroke',
    '#0b5a8f',
  ),
  strokeWidth: resolveStrokeWidth(
    rectangleShapeStyleFactory,
    'rectangle-shape-stroke',
    1.5,
  ),
})

export const triangleShapeTheme = Object.freeze({
  fill: resolveFill(
    triangleShapeStyleFactory,
    'triangle-shape-fill',
    '#1d9bf0',
  ),
  stroke: resolveStroke(
    triangleShapeStyleFactory,
    'triangle-shape-stroke',
    '#0b5a8f',
  ),
  strokeWidth: resolveStrokeWidth(
    triangleShapeStyleFactory,
    'triangle-shape-stroke',
    1.5,
  ),
})

export const lineShapeTheme = Object.freeze({
  stroke: resolveStroke(lineShapeStyleFactory, 'line-shape-stroke', '#38bdf8'),
  strokeWidth: resolveStrokeWidth(lineShapeStyleFactory, 'line-shape-stroke', 2),
})

export const knobShapeTheme = Object.freeze({
  faceFill: resolveFill(knobShapeStyleFactory, 'knob-face-fill', '#1f2937'),
  faceStroke: resolveStroke(knobShapeStyleFactory, 'knob-face-stroke', '#0f172a'),
  faceStrokeWidth: resolveStrokeWidth(
    knobShapeStyleFactory,
    'knob-face-stroke',
    1.5,
  ),
  indicatorStroke: resolveStroke(
    knobShapeStyleFactory,
    'knob-indicator-stroke',
    '#e5e7eb',
  ),
  indicatorStrokeWidth: resolveStrokeWidth(
    knobShapeStyleFactory,
    'knob-indicator-stroke',
    3,
  ),
})

export const triangleKnobTheme = Object.freeze({
  faceFill: resolveFill(
    triangleKnobStyleFactory,
    'triangle-knob-face-fill',
    '#1f2937',
  ),
  faceStroke: resolveStroke(
    triangleKnobStyleFactory,
    'triangle-knob-face-stroke',
    '#0f172a',
  ),
  faceStrokeWidth: resolveStrokeWidth(
    triangleKnobStyleFactory,
    'triangle-knob-face-stroke',
    1.5,
  ),
  indicatorFill: resolveFill(
    triangleKnobStyleFactory,
    'triangle-knob-indicator-fill',
    '#f59e0b',
  ),
  indicatorStroke: resolveStroke(
    triangleKnobStyleFactory,
    'triangle-knob-indicator-stroke',
    '#7c2d12',
  ),
  indicatorStrokeWidth: resolveStrokeWidth(
    triangleKnobStyleFactory,
    'triangle-knob-indicator-stroke',
    1.2,
  ),
})

export const distrbutedDistributionTheme = Object.freeze({
  pathStroke: resolveStroke(
    distrbutedDistributionStyleFactory,
    'distribution-path',
    '#38bdf8',
  ),
  pathStrokeWidth: resolveStrokeWidth(
    distrbutedDistributionStyleFactory,
    'distribution-path',
    1.5,
  ),
  sourceFill: resolveFill(
    distrbutedDistributionStyleFactory,
    'distribution-source-fill',
    '#1d9bf0',
  ),
  sourceStroke: resolveStroke(
    distrbutedDistributionStyleFactory,
    'distribution-source-stroke',
    '#0b5a8f',
  ),
  sourceStrokeWidth: resolveStrokeWidth(
    distrbutedDistributionStyleFactory,
    'distribution-source-stroke',
    1.2,
  ),
})

export const circleLabelDistributionTheme = Object.freeze({
  guideStroke: resolveStroke(
    circleLabelDistributionStyleFactory,
    'circle-label-guide',
    '#38bdf8',
  ),
  guideStrokeWidth: resolveStrokeWidth(
    circleLabelDistributionStyleFactory,
    'circle-label-guide',
    1.5,
  ),
})

export const labelFeatureTheme = Object.freeze({
  default: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-default',
      '#1d9bf0',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-default',
      '#0b5a8f',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-default',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-default',
      '#f8fafc',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-default',
      '#f8fafc',
    ),
  }),
  active: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-active',
      '#2563eb',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-active',
      '#1d4ed8',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-active',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-active',
      '#ffffff',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-active',
      '#dbeafe',
    ),
  }),
  error: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-error',
      '#ef4444',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-error',
      '#991b1b',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-error',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-error',
      '#ffffff',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-error',
      '#fecaca',
    ),
  }),
  success: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-success',
      '#16a34a',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-success',
      '#166534',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-success',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-success',
      '#ffffff',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-success',
      '#bbf7d0',
    ),
  }),
  warning: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-warning',
      '#f59e0b',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-warning',
      '#b45309',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-warning',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-warning',
      '#111827',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-warning',
      '#fde68a',
    ),
  }),
  info: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-info',
      '#0ea5e9',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-info',
      '#0369a1',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-info',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-info',
      '#ffffff',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-info',
      '#bae6fd',
    ),
  }),
  disabled: Object.freeze({
    fill: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-fill-disabled',
      '#1d9bf0',
    ),
    stroke: resolveStroke(
      labelFeatureStyleFactory,
      'label-feature-stroke-disabled',
      '#0b5a8f',
    ),
    strokeWidth: resolveStrokeWidth(
      labelFeatureStyleFactory,
      'label-feature-stroke-disabled',
      1.2,
    ),
    text: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-text-disabled',
      '#cbd5e1',
    ),
    title: resolveFill(
      labelFeatureStyleFactory,
      'label-feature-title-disabled',
      '#cbd5e1',
    ),
  }),
})

export const propertyPanelTheme = Object.freeze({
  panelBackground: resolveFill(
    propertyPanelStyleFactory,
    'property-panel-surface',
    '#0f172a',
  ),
  panelBorder: resolveStroke(
    propertyPanelStyleFactory,
    'property-panel-surface',
    '#334155',
  ),
  typeBackground: resolveFill(
    propertyPanelStyleFactory,
    'property-panel-type',
    '#0c4a6e',
  ),
  typeBorder: resolveStroke(
    propertyPanelStyleFactory,
    'property-panel-type',
    '#38bdf8',
  ),
})

export const webCardTheme = Object.freeze({
  surfaceBackground: resolveFill(webCardStyleFactory, 'web-card-surface', '#0b1220'),
  surfaceBorder: resolveStroke(webCardStyleFactory, 'web-card-surface', '#334155'),
  headerBackground: resolveFill(webCardStyleFactory, 'web-card-header', '#0ea5e9'),
  headerBorder: resolveStroke(webCardStyleFactory, 'web-card-header', '#0369a1'),
  headerText: resolveFill(webCardStyleFactory, 'web-card-header-text', '#f8fafc'),
  mainBackground: resolveFill(webCardStyleFactory, 'web-card-main', '#0f172a'),
  mainBorder: resolveStroke(webCardStyleFactory, 'web-card-main', '#334155'),
  footerBackground: resolveFill(webCardStyleFactory, 'web-card-footer', '#111827'),
  footerBorder: resolveStroke(webCardStyleFactory, 'web-card-footer', '#334155'),
  footerText: resolveFill(webCardStyleFactory, 'web-card-footer-text', '#cbd5e1'),
})

const GLOBAL_STYLE_ID = 'ui-controls-global-token-styles'

export function applyGlobalTokenStyles(
  target: HTMLElement = document.documentElement,
): void {
  target.style.setProperty('--color-bg', globalDesignTokens.colors.bg)
  target.style.setProperty('--color-fg', globalDesignTokens.colors.fg)
  target.style.setProperty('--color-accent', globalDesignTokens.colors.accent)
  target.style.setProperty('--color-warning', globalDesignTokens.colors.warning)
  target.style.setProperty('--color-clip', globalDesignTokens.colors.clip)
  target.style.setProperty('--color-active', globalDesignTokens.colors.active)
  target.style.setProperty('--color-inactive', globalDesignTokens.colors.inactive)
  target.style.setProperty(
    '--color-led-active',
    globalDesignTokens.colors.ledActive,
  )
  target.style.setProperty(
    '--color-led-inactive',
    globalDesignTokens.colors.ledInactive,
  )

  target.style.setProperty('--size-xs', globalDesignTokens.sizes.xs)
  target.style.setProperty('--size-sm', globalDesignTokens.sizes.sm)
  target.style.setProperty('--size-md', globalDesignTokens.sizes.md)
  target.style.setProperty('--size-lg', globalDesignTokens.sizes.lg)
  target.style.setProperty('--size-xl', globalDesignTokens.sizes.xl)

  target.style.setProperty('--radius-none', globalDesignTokens.radius.none)
  target.style.setProperty('--radius-sm', globalDesignTokens.radius.sm)
  target.style.setProperty('--radius-md', globalDesignTokens.radius.md)
  target.style.setProperty('--radius-lg', globalDesignTokens.radius.lg)
  target.style.setProperty('--radius-full', globalDesignTokens.radius.full)

  target.style.setProperty('--font-ui', globalDesignTokens.typography.ui)
  target.style.setProperty('--font-mono', globalDesignTokens.typography.mono)
  target.style.setProperty('--font-size-xs', globalDesignTokens.typography.sizeXs)
  target.style.setProperty('--font-size-sm', globalDesignTokens.typography.sizeSm)
  target.style.setProperty('--font-size-md', globalDesignTokens.typography.sizeMd)
  target.style.setProperty('--font-size-lg', globalDesignTokens.typography.sizeLg)

  target.style.setProperty('--shadow-soft', globalDesignTokens.effects.shadowSoft)
  target.style.setProperty('--shadow-hard', globalDesignTokens.effects.shadowHard)
  target.style.setProperty('--glow-accent', globalDesignTokens.effects.glowAccent)
  target.style.setProperty('--glow-warning', globalDesignTokens.effects.glowWarning)
  target.style.setProperty('--glow-led', globalDesignTokens.effects.glowLed)

  target.style.setProperty('--space-xs', globalDesignTokens.spacing.xs)
  target.style.setProperty('--space-sm', globalDesignTokens.spacing.sm)
  target.style.setProperty('--space-md', globalDesignTokens.spacing.md)
  target.style.setProperty('--space-lg', globalDesignTokens.spacing.lg)

  target.style.setProperty('--stroke-thin', globalDesignTokens.stroke.thin)
  target.style.setProperty('--stroke-normal', globalDesignTokens.stroke.normal)
  target.style.setProperty('--stroke-bold', globalDesignTokens.stroke.bold)

  target.style.setProperty('--ui-font-ui', 'var(--font-ui)')
  target.style.setProperty('--ui-body-bg', 'var(--color-bg)')
  target.style.setProperty('--ui-text-primary', 'var(--color-fg)')
  target.style.setProperty('--ui-text-muted', '#cbd5e1')
  target.style.setProperty('--ui-text-bright', '#f8fafc')

  target.style.setProperty('--ui-space-sm', 'var(--space-sm)')
  target.style.setProperty('--ui-space-md', 'var(--space-md)')
  target.style.setProperty('--ui-space-lg', 'var(--space-lg)')
  target.style.setProperty('--ui-radius-sm', 'var(--radius-sm)')
  target.style.setProperty('--ui-radius-md', 'var(--radius-md)')
  target.style.setProperty('--ui-button-font-size', 'var(--font-size-md)')
  target.style.setProperty('--ui-heading-font-size', 'var(--font-size-lg)')

  target.style.setProperty('--ui-shell-bg', appTheme.shellBackground)
  target.style.setProperty('--ui-shell-border', appTheme.shellBorder)
  target.style.setProperty('--ui-layout-app-max-width', APP_LAYOUT_CSS_TOKENS.appMaxWidth)
  target.style.setProperty('--ui-layout-app-padding', APP_LAYOUT_CSS_TOKENS.appPadding)
  target.style.setProperty('--ui-layout-min-height', APP_LAYOUT_CSS_TOKENS.minHeight)
  target.style.setProperty('--ui-layout-menu-min-width', APP_LAYOUT_CSS_TOKENS.menuMinWidth)
  target.style.setProperty('--ui-layout-menu-column', APP_LAYOUT_CSS_TOKENS.menuColumn)
  target.style.setProperty('--ui-layout-view-column', APP_LAYOUT_CSS_TOKENS.viewColumn)
  target.style.setProperty(
    '--ui-layout-template-grid-max-width',
    APP_LAYOUT_CSS_TOKENS.templateGridMaxWidth,
  )
  target.style.setProperty(
    '--ui-layout-template-card-max-width',
    APP_LAYOUT_CSS_TOKENS.templateCardMaxWidth,
  )
  target.style.setProperty('--ui-menu-panel-bg', viewMenuTheme.panelBackground)
  target.style.setProperty('--ui-menu-panel-border', viewMenuTheme.panelBorder)
  target.style.setProperty('--ui-button-bg', viewMenuTheme.buttonBackground)
  target.style.setProperty('--ui-button-border', viewMenuTheme.buttonBorder)
  target.style.setProperty('--ui-button-text', viewMenuTheme.buttonText)
  target.style.setProperty('--ui-button-hover-bg', viewMenuTheme.buttonHoverBackground)
  target.style.setProperty('--ui-button-hover-border', viewMenuTheme.buttonHoverBorder)
  target.style.setProperty(
    '--ui-button-pressed-bg',
    viewMenuTheme.buttonPressedBackground,
  )
  target.style.setProperty(
    '--ui-button-pressed-border',
    viewMenuTheme.buttonPressedBorder,
  )
  target.style.setProperty('--ui-button-focus-ring', viewMenuTheme.buttonFocusRing)
  target.style.setProperty(
    '--ui-button-disabled-bg',
    viewMenuTheme.buttonDisabledBackground,
  )
  target.style.setProperty(
    '--ui-button-disabled-border',
    viewMenuTheme.buttonDisabledBorder,
  )
  target.style.setProperty(
    '--ui-button-disabled-text',
    viewMenuTheme.buttonDisabledText,
  )
  target.style.setProperty(
    '--ui-button-disabled-opacity',
    viewMenuTheme.buttonDisabledOpacity,
  )
  target.style.setProperty(
    '--ui-button-destructive-bg',
    viewMenuTheme.buttonDestructiveBackground,
  )
  target.style.setProperty(
    '--ui-button-destructive-border',
    viewMenuTheme.buttonDestructiveBorder,
  )
  target.style.setProperty(
    '--ui-button-destructive-hover-bg',
    viewMenuTheme.buttonDestructiveHoverBackground,
  )
  target.style.setProperty(
    '--ui-button-destructive-hover-border',
    viewMenuTheme.buttonDestructiveHoverBorder,
  )
  target.style.setProperty(
    '--ui-button-destructive-pressed-bg',
    viewMenuTheme.buttonDestructivePressedBackground,
  )
  target.style.setProperty(
    '--ui-button-destructive-pressed-border',
    viewMenuTheme.buttonDestructivePressedBorder,
  )
  target.style.setProperty('--ui-button-active-bg', viewMenuTheme.buttonActiveBackground)
  target.style.setProperty('--ui-button-active-border', viewMenuTheme.buttonActiveBorder)
  target.style.setProperty('--ui-panel-shadow', appTheme.panelShadow)
  target.style.setProperty('--ui-view-panel-bg', currentViewPresenterTheme.surfaceBackground)
  target.style.setProperty('--ui-view-panel-border', currentViewPresenterTheme.surfaceBorder)

  target.style.setProperty('--ui-template-frame-bg', templateHostTheme.frameBackground)
  target.style.setProperty('--ui-template-frame-border', templateHostTheme.frameBorder)
  target.style.setProperty('--ui-template-frame-min-width', templateHostTheme.frameMinWidth)
  target.style.setProperty('--ui-template-frame-min-height', templateHostTheme.frameMinHeight)
  target.style.setProperty('--ui-label-title-default', labelFeatureTheme.default.title)
  target.style.setProperty('--ui-label-title-active', labelFeatureTheme.active.title)
  target.style.setProperty('--ui-label-title-error', labelFeatureTheme.error.title)
  target.style.setProperty('--ui-label-title-success', labelFeatureTheme.success.title)
  target.style.setProperty('--ui-label-title-warning', labelFeatureTheme.warning.title)
  target.style.setProperty('--ui-label-title-info', labelFeatureTheme.info.title)
  target.style.setProperty(
    '--ui-label-title-disabled',
    labelFeatureTheme.disabled.title,
  )
  target.style.setProperty('--ui-web-card-bg', webCardTheme.surfaceBackground)
  target.style.setProperty('--ui-web-card-border', webCardTheme.surfaceBorder)
  target.style.setProperty('--ui-web-card-header-bg', webCardTheme.headerBackground)
  target.style.setProperty('--ui-web-card-header-border', webCardTheme.headerBorder)
  target.style.setProperty('--ui-web-card-header-text', webCardTheme.headerText)
  target.style.setProperty('--ui-web-card-main-bg', webCardTheme.mainBackground)
  target.style.setProperty('--ui-web-card-main-border', webCardTheme.mainBorder)
  target.style.setProperty('--ui-web-card-footer-bg', webCardTheme.footerBackground)
  target.style.setProperty('--ui-web-card-footer-border', webCardTheme.footerBorder)
  target.style.setProperty('--ui-web-card-footer-text', webCardTheme.footerText)
  target.style.setProperty(
    '--ui-property-panel-bg',
    propertyPanelTheme.panelBackground,
  )
  target.style.setProperty(
    '--ui-property-panel-border',
    propertyPanelTheme.panelBorder,
  )
  target.style.setProperty(
    '--ui-property-type-bg',
    propertyPanelTheme.typeBackground,
  )
  target.style.setProperty(
    '--ui-property-type-border',
    propertyPanelTheme.typeBorder,
  )
}

export function installGlobalTokenStyles(doc: Document = document): void {
  if (doc.getElementById(GLOBAL_STYLE_ID) !== null) {
    return
  }

  const style = doc.createElement('style')
  style.id = GLOBAL_STYLE_ID
  style.textContent = `
    html,
    body {
      margin: 0;
      width: 100%;
      height: 100%;
      min-height: 100%;
      background: var(--ui-body-bg);
      color: var(--ui-text-primary);
      font-family: var(--ui-font-ui);
      color-scheme: light dark;
    }

    body {
      min-width: 320px;
      min-height: 100svh;
      padding: 0;
      box-sizing: border-box;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
    }
  `
  doc.head.append(style)
}

export const dualSectorShapeStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }

  svg {
    display: block;
    overflow: visible;
  }
`

export const circleShapeStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }
`

export const rectangleShapeStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }
`

export const triangleShapeStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }
`

export const lineShapeStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }
`

export const knobShapeStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }

  :host([variant='neon']) svg-template-host {
    filter: drop-shadow(var(--glow-accent));
  }

  :host([variant='hardware']) svg-template-host {
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.45));
  }

  :host([variant='retro']) svg-template-host {
    filter: drop-shadow(var(--glow-warning));
  }
`

export const triangleKnobStyles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  .knob {
    position: relative;
    display: grid;
    place-items: center;
    width: fit-content;
    height: fit-content;
    margin-inline: auto;
  }

  .face {
    display: block;
    width: 100%;
    height: 100%;
  }

  .indicator {
    position: absolute;
    display: block;
    width: fit-content;
    height: fit-content;
    pointer-events: none;
    transform-origin: center;
  }

  .indicator triangle-shape {
    display: block;
  }
`

export const svgTemplateHostStyles = css`
  :host {
    display: inline-block;
  }

  .frame {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--ui-template-frame-min-width);
    min-height: var(--ui-template-frame-min-height);
    padding: var(--ui-space-sm);
    border: 1px solid var(--ui-template-frame-border);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-template-frame-bg);
    box-sizing: border-box;
  }

  .frame > img,
  .frame > svg {
    display: block;
    max-width: 100%;
    height: auto;
  }

  .frame.compact {
    min-width: 0;
    min-height: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .frame.compact > img,
  .frame.compact > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const multiViewAppStyles = css`
  :host {
    display: block;
    width: min(var(--ui-layout-app-max-width), 100%);
    min-height: 100svh;
    box-sizing: border-box;
    padding: var(--ui-layout-app-padding);
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  main {
    display: grid;
    gap: var(--ui-space-md);
    width: 100%;
    min-height: var(--ui-layout-min-height);
    border: 1px solid var(--ui-shell-border);
    border-radius: var(--ui-radius-md);
    background: var(--ui-shell-bg);
    padding: var(--ui-space-md);
    box-shadow: var(--ui-panel-shadow);
    box-sizing: border-box;
    overflow: hidden;
  }
`

export const viewMenuStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(
      var(--ui-layout-menu-min-width),
      var(--ui-layout-menu-column)
    ) minmax(0, var(--ui-layout-view-column));
    gap: var(--ui-space-md);
    min-height: var(--ui-layout-min-height);
    height: 100%;
    align-items: stretch;
  }

  .menu-panel {
    border: 1px solid var(--ui-menu-panel-border);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-menu-panel-bg);
    padding: var(--ui-space-sm);
    box-sizing: border-box;
  }

  .view-panel {
    border: 1px solid var(--ui-view-panel-border);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-view-panel-bg);
    padding: var(--ui-space-sm);
    box-sizing: border-box;
    overflow: auto;
    min-height: 0;
  }

  .view-panel ::slotted(*) {
    display: block;
    width: 100%;
    height: 100%;
  }

  nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--ui-space-sm);
    width: 100%;
  }

  button {
    border: 1px solid var(--ui-button-border);
    background: var(--ui-button-bg);
    color: var(--ui-button-text);
    border-radius: var(--ui-radius-sm);
    padding: var(--ui-space-sm) calc(var(--ui-space-sm) + 4px);
    cursor: pointer;
    font-size: var(--ui-button-font-size);
    font-family: var(--ui-font-ui);
    text-align: left;
    transition:
      background-color 140ms ease,
      border-color 140ms ease,
      transform 80ms ease;
  }

  button.active {
    border-color: var(--ui-button-active-border);
    color: var(--ui-text-bright);
    background: var(--ui-button-active-bg);
  }

  button:hover:not(:disabled):not(.active) {
    border-color: var(--ui-button-hover-border);
    background: var(--ui-button-hover-bg);
  }

  button:active:not(:disabled):not(.active) {
    border-color: var(--ui-button-pressed-border);
    background: var(--ui-button-pressed-bg);
    transform: translateY(1px);
  }

  button:focus-visible {
    outline: 2px solid var(--ui-button-focus-ring);
    outline-offset: 2px;
  }

  button:disabled {
    border-color: var(--ui-button-disabled-border);
    background: var(--ui-button-disabled-bg);
    color: var(--ui-button-disabled-text);
    opacity: var(--ui-button-disabled-opacity);
    cursor: not-allowed;
  }

  button.destructive {
    border-color: var(--ui-button-destructive-border);
    background: var(--ui-button-destructive-bg);
    color: var(--ui-text-bright);
  }

  button.destructive:hover:not(:disabled) {
    border-color: var(--ui-button-destructive-hover-border);
    background: var(--ui-button-destructive-hover-bg);
  }

  button.destructive:active:not(:disabled) {
    border-color: var(--ui-button-destructive-pressed-border);
    background: var(--ui-button-destructive-pressed-bg);
    transform: translateY(1px);
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
      min-height: auto;
      height: auto;
    }

    .menu-panel {
      order: 1;
    }

    .view-panel {
      order: 2;
    }
  }
`

export const currentViewPresenterStyles = css`
  :host {
    display: grid;
    gap: var(--ui-space-sm);
    min-height: 100%;
  }

  h2 {
    margin: 0;
    color: var(--ui-text-bright);
    font-size: var(--ui-heading-font-size);
    font-weight: 600;
  }

  h3 {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: 14px;
    font-weight: 600;
  }

  .presenter {
    display: grid;
    place-items: start stretch;
    gap: var(--ui-space-sm);
    min-height: 100%;
    padding: 0;
  }

  .stack {
    display: grid;
    gap: var(--ui-space-md);
    place-items: center;
  }

  .template-grid {
    display: grid;
    gap: var(--ui-space-md);
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    width: 100%;
    max-width: var(--ui-layout-template-grid-max-width);
  }

  .template-item {
    display: grid;
    gap: var(--ui-space-sm);
    place-items: start;
  }

  .template-item svg-template-host {
    width: 100%;
    max-width: var(--ui-layout-template-card-max-width);
  }

  .demo-grid {
    display: grid;
    gap: var(--ui-space-md);
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    width: 100%;
  }

  .demo-card {
    display: grid;
    gap: var(--ui-space-sm);
    padding: var(--ui-space-sm);
    border: 1px solid var(--ui-view-panel-border);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-menu-panel-bg);
    box-sizing: border-box;
    place-items: start stretch;
  }

  .demo-card h3 {
    margin: 0;
  }

  .demo-card p {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: 13px;
  }

  .demo-card circle-label-distribution,
  .demo-card dual-sector-shape,
  .demo-card circle-shape,
  .demo-card rectangle-shape,
  .demo-card triangle-shape,
  .demo-card line-shape,
  .demo-card knob-shape,
  .demo-card triangle-indicator-knob,
  .demo-card distrbuted-distribution,
  .demo-card label-feature,
  .demo-card web-card,
  .demo-card property-panel,
  .demo-card svg-template-host {
    width: 100%;
  }
`

export const distrbutedDistributionStyles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  svg {
    width: 100%;
    max-width: 720px;
    height: auto;
    border: 1px solid var(--ui-template-frame-border);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-template-frame-bg);
  }
`

export const circleLabelDistributionStyles = css`
  :host {
    display: grid;
    place-items: center;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  .distribution {
    position: relative;
    width: min(100%, var(--distribution-size, 420px));
    aspect-ratio: 1 / 1;
    max-width: 100%;
  }

  .guide-host {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .item {
    position: absolute;
    display: grid;
    place-items: center;
  }

  .item svg-template-host {
    width: 100%;
    height: 100%;
  }
`

export const uiLabelStyles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  :host([variant='retro']) {
    font-family: var(--font-mono);
  }

  :host([theme='light']) {
    color: #0f172a;
  }

  .ui-label {
    display: grid;
    place-items: stretch;
    width: 100%;
    height: 100%;
  }

  :host([variant='neon']) .ui-label {
    filter: drop-shadow(var(--glow-accent));
  }

  .ui-label svg-template-host {
    width: 100%;
    height: 100%;
  }
`

export const labelFeatureStyles = css`
  :host {
    --ui-label-title-color: var(--ui-label-title-default);
    display: grid;
    gap: var(--ui-space-sm);
    place-items: start;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  :host([variant='retro']) {
    font-family: var(--font-mono);
  }

  :host([variant='neon']) {
    --ui-label-title-color: var(--color-accent);
  }

  :host([variant='minimal']) {
    --ui-label-title-color: var(--color-fg);
  }

  :host([theme='light']) {
    --ui-label-title-color: #0f172a;
    color: #0f172a;
  }

  :host([state='active']) {
    --ui-label-title-color: var(--ui-label-title-active);
  }

  :host([state='error']) {
    --ui-label-title-color: var(--ui-label-title-error);
  }

  :host([state='success']) {
    --ui-label-title-color: var(--ui-label-title-success);
  }

  :host([state='warning']) {
    --ui-label-title-color: var(--ui-label-title-warning);
  }

  :host([state='info']) {
    --ui-label-title-color: var(--ui-label-title-info);
  }

  :host([state='disabled']) {
    --ui-label-title-color: var(--ui-label-title-disabled);
  }

  .label-feature {
    display: grid;
    gap: var(--ui-space-sm);
    place-items: start;
    width: 100%;
  }

  h2 {
    margin: 0;
    color: var(--ui-label-title-color);
  }
`

export const webCardStyles = css`
  :host {
    --web-card-bg: var(--ui-web-card-bg);
    --web-card-border: var(--ui-web-card-border);
    --web-card-header-bg: var(--ui-web-card-header-bg);
    --web-card-header-border: var(--ui-web-card-header-border);
    --web-card-header-text: var(--ui-web-card-header-text);
    --web-card-main-bg: var(--ui-web-card-main-bg);
    --web-card-main-border: var(--ui-web-card-main-border);
    --web-card-footer-bg: var(--ui-web-card-footer-bg);
    --web-card-footer-border: var(--ui-web-card-footer-border);
    --web-card-footer-text: var(--ui-web-card-footer-text);
    --web-card-shadow: none;
    --web-card-radius: var(--radius-md);
    display: block;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  :host([variant='hardware']) {
    --web-card-shadow: var(--shadow-hard);
  }

  :host([variant='neon']) {
    --web-card-bg: var(--color-bg);
    --web-card-border: var(--color-accent);
    --web-card-header-bg: color-mix(in srgb, var(--color-bg) 68%, var(--color-accent));
    --web-card-header-border: var(--color-accent);
    --web-card-main-bg: color-mix(in srgb, var(--color-bg) 82%, var(--color-accent));
    --web-card-main-border: var(--color-accent);
    --web-card-footer-bg: color-mix(in srgb, var(--color-bg) 74%, var(--color-accent));
    --web-card-footer-border: var(--color-accent);
    --web-card-header-text: var(--color-accent);
    --web-card-footer-text: var(--color-accent);
    --web-card-shadow: var(--glow-accent);
  }

  :host([variant='minimal']) {
    --web-card-bg: transparent;
    --web-card-border: color-mix(in srgb, var(--color-inactive) 70%, transparent);
    --web-card-header-bg: transparent;
    --web-card-header-border: color-mix(in srgb, var(--color-inactive) 60%, transparent);
    --web-card-main-bg: transparent;
    --web-card-main-border: color-mix(in srgb, var(--color-inactive) 60%, transparent);
    --web-card-footer-bg: transparent;
    --web-card-footer-border: color-mix(in srgb, var(--color-inactive) 60%, transparent);
  }

  :host([variant='retro']) {
    --web-card-bg: #201226;
    --web-card-border: var(--color-warning);
    --web-card-header-bg: #49243e;
    --web-card-header-border: var(--color-warning);
    --web-card-main-bg: #2b1640;
    --web-card-main-border: var(--color-warning);
    --web-card-footer-bg: #3b1d58;
    --web-card-footer-border: var(--color-warning);
    --web-card-header-text: #ffe4a3;
    --web-card-footer-text: #ffd89a;
    --web-card-shadow: var(--glow-warning);
    font-family: var(--font-mono);
  }

  :host([variant='rack']) {
    --web-card-bg: #0a0a0a;
    --web-card-border: var(--color-clip);
    --web-card-header-bg: #151515;
    --web-card-header-border: var(--color-clip);
    --web-card-main-bg: #111111;
    --web-card-main-border: var(--color-inactive);
    --web-card-footer-bg: #171717;
    --web-card-footer-border: var(--color-clip);
    --web-card-header-text: var(--color-accent);
    --web-card-footer-text: var(--color-fg);
  }

  :host([theme='light']) {
    --web-card-bg: #f8fafc;
    --web-card-border: #cbd5e1;
    --web-card-header-bg: #e2e8f0;
    --web-card-header-border: #cbd5e1;
    --web-card-header-text: #0f172a;
    --web-card-main-bg: #f1f5f9;
    --web-card-main-border: #dbe2ea;
    --web-card-footer-bg: #e2e8f0;
    --web-card-footer-border: #cbd5e1;
    --web-card-footer-text: #334155;
    color: #0f172a;
  }

  :host([theme='studio']) {
    --web-card-bg: #111827;
    --web-card-border: #374151;
    --web-card-header-bg: #1f2937;
    --web-card-header-border: #4b5563;
    --web-card-main-bg: #0f172a;
    --web-card-main-border: #334155;
    --web-card-footer-bg: #111827;
    --web-card-footer-border: #374151;
  }

  :host([theme='eurorack']) {
    --web-card-bg: #0a0c12;
    --web-card-border: var(--color-warning);
    --web-card-header-bg: #121827;
    --web-card-header-border: var(--color-warning);
    --web-card-main-bg: #0c1220;
    --web-card-main-border: #2f3a52;
    --web-card-footer-bg: #111a2b;
    --web-card-footer-border: var(--color-warning);
    --web-card-header-text: var(--color-accent);
    --web-card-footer-text: #f9d382;
  }

  :host([shape='square']),
  :host([shape='linear']) {
    --web-card-radius: var(--radius-none);
  }

  :host([shape='pill']) {
    --web-card-radius: var(--radius-full);
  }

  :host([shape='pad']) {
    --web-card-radius: var(--radius-lg);
  }

  :host([shape='key']) {
    --web-card-radius: var(--radius-sm);
  }

  :host([shape='led']) {
    --web-card-radius: var(--radius-full);
    --web-card-border: var(--color-led-active);
    --web-card-shadow: var(--glow-led);
  }

  .card {
    display: grid;
    grid-template-rows: auto 1fr auto;
    border: var(--stroke-thin) solid var(--web-card-border);
    background: var(--web-card-bg);
    border-radius: var(--web-card-radius);
    overflow: hidden;
    min-height: 220px;
    box-shadow: var(--web-card-shadow);
  }

  header {
    display: grid;
    align-items: center;
    border-bottom: var(--stroke-thin) solid var(--web-card-header-border);
    background: var(--web-card-header-bg);
    color: var(--web-card-header-text);
    padding: var(--ui-space-sm) var(--ui-space-md);
    font-weight: 600;
  }

  main {
    display: grid;
    place-items: center;
    border-bottom: var(--stroke-thin) solid var(--web-card-main-border);
    background: var(--web-card-main-bg);
    padding: var(--ui-space-md);
    min-height: 160px;
  }

  footer {
    display: grid;
    align-items: center;
    border-top: var(--stroke-thin) solid var(--web-card-footer-border);
    background: var(--web-card-footer-bg);
    color: var(--web-card-footer-text);
    padding: var(--ui-space-sm) var(--ui-space-md);
    font-size: var(--font-size-sm);
  }

  main ::slotted(*) {
    width: 100%;
  }
`

export const propertyPanelStyles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--ui-text-primary);
    font-family: var(--ui-font-ui);
  }

  .panel {
    display: grid;
    gap: var(--ui-space-sm);
    border: 1px solid var(--ui-property-panel-border);
    background: var(--ui-property-panel-bg);
    border-radius: var(--ui-radius-sm);
    padding: var(--ui-space-sm);
    box-sizing: border-box;
  }

  header {
    display: grid;
    gap: 2px;
  }

  h3 {
    margin: 0;
    color: var(--ui-text-bright);
    font-size: 14px;
  }

  p {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  th,
  td {
    padding: 6px;
    border-bottom: 1px solid var(--ui-view-panel-border);
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--ui-text-muted);
    font-weight: 600;
  }

  .name,
  .value {
    color: var(--ui-text-bright);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .description {
    color: var(--ui-text-muted);
  }

  .type {
    display: inline-block;
    border: 1px solid var(--ui-property-type-border);
    background: var(--ui-property-type-bg);
    border-radius: 6px;
    padding: 2px 6px;
    line-height: 1.2;
    color: var(--ui-text-bright);
    text-transform: lowercase;
  }

  .empty {
    color: var(--ui-text-muted);
    font-size: 13px;
  }
`
