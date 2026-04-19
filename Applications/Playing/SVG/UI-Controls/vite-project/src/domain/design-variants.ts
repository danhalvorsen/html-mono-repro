export type UiVariant = 'flat' | 'hardware' | 'neon' | 'minimal' | 'retro' | 'rack'

export type UiTheme = 'dark' | 'light' | 'studio' | 'eurorack'

export type UiShape =
  | 'round'
  | 'square'
  | 'pill'
  | 'key'
  | 'pad'
  | 'linear'
  | 'led'

export interface VisualVariantProperties {
  readonly variant: UiVariant
  readonly theme: UiTheme
  readonly shape: UiShape
}

export const UI_VARIANTS = Object.freeze([
  'flat',
  'hardware',
  'neon',
  'minimal',
  'retro',
  'rack',
] as const)

export const UI_THEMES = Object.freeze([
  'dark',
  'light',
  'studio',
  'eurorack',
] as const)

export const UI_SHAPES = Object.freeze([
  'round',
  'square',
  'pill',
  'key',
  'pad',
  'linear',
  'led',
] as const)
