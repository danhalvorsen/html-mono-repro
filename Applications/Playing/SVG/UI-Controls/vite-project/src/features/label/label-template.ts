import { html, type TemplateResult } from 'lit'
import { labelFeatureTheme } from '../../application/ui-style-module.js'
import type {
  UiShape,
  UiTheme,
  UiVariant,
} from '../../domain/design-variants.js'

export type LabelState =
  | 'default'
  | 'active'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'disabled'

function resolveState(state: string): LabelState {
  switch (state) {
    case 'active':
    case 'error':
    case 'warning':
    case 'info':
    case 'success':
    case 'disabled':
      return state
    default:
      return 'default'
  }
}

function resolveVariant(variant: string): UiVariant {
  switch (variant) {
    case 'hardware':
    case 'neon':
    case 'minimal':
    case 'retro':
    case 'rack':
      return variant
    default:
      return 'flat'
  }
}

function resolveTheme(theme: string): UiTheme {
  switch (theme) {
    case 'light':
    case 'studio':
    case 'eurorack':
      return theme
    default:
      return 'dark'
  }
}

function resolveShape(shape: string): UiShape {
  switch (shape) {
    case 'round':
    case 'square':
    case 'pill':
    case 'key':
    case 'pad':
    case 'linear':
    case 'led':
      return shape
    default:
      return 'pill'
  }
}

function cornerRadiusForShape(shape: UiShape): { rx: number; ry: number } {
  if (shape === 'square' || shape === 'linear') {
    return { rx: 4, ry: 4 }
  }
  if (shape === 'round') {
    return { rx: 24, ry: 24 }
  }
  if (shape === 'pill' || shape === 'led') {
    return { rx: 30, ry: 30 }
  }
  if (shape === 'pad') {
    return { rx: 18, ry: 18 }
  }
  return { rx: 10, ry: 10 }
}

function applyVariant(
  input: { fill: string; stroke: string; text: string; strokeWidth: number },
  variant: UiVariant,
  theme: UiTheme,
): {
  fill: string
  stroke: string
  text: string
  strokeWidth: number
  filter: string
} {
  if (variant === 'neon') {
    return {
      fill: 'var(--color-bg)',
      stroke: 'var(--color-accent)',
      text: 'var(--color-accent)',
      strokeWidth: Math.max(1.5, input.strokeWidth),
      filter: 'drop-shadow(var(--glow-accent))',
    }
  }

  if (variant === 'minimal') {
    return {
      fill: 'transparent',
      stroke: 'var(--color-inactive)',
      text: theme === 'light' ? '#111827' : 'var(--color-fg)',
      strokeWidth: Math.max(1, input.strokeWidth),
      filter: 'none',
    }
  }

  if (variant === 'hardware') {
    return {
      fill: '#1f2937',
      stroke: '#0f172a',
      text: '#f8fafc',
      strokeWidth: Math.max(1.4, input.strokeWidth),
      filter: 'none',
    }
  }

  if (variant === 'retro') {
    return {
      fill: 'var(--color-warning)',
      stroke: '#7c2d12',
      text: '#111827',
      strokeWidth: Math.max(1.2, input.strokeWidth),
      filter: 'none',
    }
  }

  if (variant === 'rack') {
    return {
      fill: 'var(--color-clip)',
      stroke: 'var(--color-accent)',
      text: '#f8fafc',
      strokeWidth: Math.max(1.2, input.strokeWidth),
      filter: 'none',
    }
  }

  if (theme === 'light') {
    return {
      fill: '#e2e8f0',
      stroke: '#94a3b8',
      text: '#111827',
      strokeWidth: input.strokeWidth,
      filter: 'none',
    }
  }

  if (theme === 'studio') {
    return {
      fill: '#1e293b',
      stroke: '#334155',
      text: '#e2e8f0',
      strokeWidth: input.strokeWidth,
      filter: 'none',
    }
  }

  if (theme === 'eurorack') {
    return {
      fill: '#0b0f1a',
      stroke: 'var(--color-warning)',
      text: 'var(--color-accent)',
      strokeWidth: Math.max(1.3, input.strokeWidth),
      filter: 'none',
    }
  }

  return { ...input, filter: 'none' }
}

export function buildLabelSvgTemplate(
  value: string,
  scale = 1,
  state: LabelState = 'default',
  variant: UiVariant = 'flat',
  theme: UiTheme = 'dark',
  shape: UiShape = 'pill',
): TemplateResult {
  const textValue = value.trim() === '' ? 'Label' : value
  const normalizedScale = Math.max(0.05, scale)
  const normalizedState = resolveState(state)
  const normalizedVariant = resolveVariant(variant)
  const normalizedTheme = resolveTheme(theme)
  const normalizedShape = resolveShape(shape)
  const palette = labelFeatureTheme[normalizedState]
  const styledPalette = applyVariant(
    {
      fill: palette.fill,
      stroke: palette.stroke,
      text: palette.text,
      strokeWidth: palette.strokeWidth,
    },
    normalizedVariant,
    normalizedTheme,
  )
  const radius = cornerRadiusForShape(normalizedShape)
  const opacity = normalizedState === 'disabled' ? 0.38 : 1

  return html`
    <svg viewBox="0 0 240 80" role="img" aria-label=${`Label ${textValue}`}>
      <g
        transform=${`translate(120 40) scale(${normalizedScale}) translate(-120 -40)`}
        style=${`filter:${styledPalette.filter};`}
        opacity=${opacity}
      >
        <rect
          x="8"
          y="10"
          width="224"
          height="60"
          rx=${radius.rx}
          ry=${radius.ry}
          fill=${styledPalette.fill}
          stroke=${styledPalette.stroke}
          stroke-width=${styledPalette.strokeWidth}
        ></rect>
        <text
          x="120"
          y="40"
          text-anchor="middle"
          dominant-baseline="middle"
          alignment-baseline="middle"
          fill=${styledPalette.text}
          font-size="30"
          font-weight="700"
          font-family="var(--ui-font-ui)"
        >
          ${textValue}
        </text>
      </g>
    </svg>
  `
}
