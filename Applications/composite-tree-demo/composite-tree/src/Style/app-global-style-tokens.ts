import type { IGlobalStyleToken } from './global-style-system'

export const APP_GLOBAL_STYLE_TOKENS = {
  base: {
    name: 'base',
    config: {
      root: {
        'color-scheme': 'light',
      },
      html: {
        background: 'transparent',
      },
      body: {
        margin: '0',
        'min-width': '320px',
        'min-height': '100svh',
        'font-family': "'Segoe UI', system-ui, sans-serif",
        'font-synthesis': 'none',
        'text-rendering': 'optimizeLegibility',
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
        'overflow-x': 'hidden',
      },
    },
  },
  app: {
    name: 'app',
    extends: ['base'],
    config: {
      root: {
        background:
          'radial-gradient(circle at top left, rgba(251, 191, 36, 0.28), transparent 28%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.2), transparent 26%), linear-gradient(135deg, #fffaf2 0%, #fff3e7 52%, #eef7ff 100%)',
      },
      body: {
        background:
          'linear-gradient(rgba(20, 33, 61, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 33, 61, 0.04) 1px, transparent 1px), transparent',
        'background-size': '36px 36px, 36px 36px, auto',
      },
    },
  },
  canvas: {
    name: 'canvas',
    extends: ['app'],
    config: {
      root: {
        '--canvas-safe-margin': '14px',
      },
    },
  },
} as const satisfies Readonly<Record<string, IGlobalStyleToken>>
