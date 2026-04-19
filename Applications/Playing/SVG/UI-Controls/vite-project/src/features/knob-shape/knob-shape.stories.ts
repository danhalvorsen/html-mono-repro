import { html } from 'lit'
import { UI_SHAPES, UI_THEMES, UI_VARIANTS } from '../../domain/design-variants.js'

import './knob-shape.js'

const INDICATOR_LINECAP_OPTIONS = ['butt', 'round', 'square'] as const

type UiVariantOption = (typeof UI_VARIANTS)[number]
type UiThemeOption = (typeof UI_THEMES)[number]
type UiShapeOption = (typeof UI_SHAPES)[number]
type StrokeLinecapOption = (typeof INDICATOR_LINECAP_OPTIONS)[number]

interface KnobShapeStoryArgs {
  readonly size: number
  readonly value: number
  readonly variant: UiVariantOption
  readonly theme: UiThemeOption
  readonly shape: UiShapeOption
  readonly minAngle: number
  readonly maxAngle: number
  readonly indicatorOffsetRatio: number
  readonly indicatorLengthRatio: number
  readonly indicatorWidth: number
  readonly indicatorLinecap: StrokeLinecapOption
  readonly indicatorOpacity: number
  readonly indicatorColor: string
}

const meta = {
  title: 'Applications/SVG UI Controls/Knob Shape',
  tags: ['autodocs'],
  render: (args: KnobShapeStoryArgs) => {
    const isLightTheme = args.theme === 'light'
    const frameBackground = isLightTheme ? '#f8fafc' : '#0f172a'
    const frameBorder = isLightTheme ? '#cbd5e1' : '#334155'

    return html`
      <div
        style="
          display: grid;
          place-items: center;
          min-width: 240px;
          min-height: 240px;
          padding: 16px;
          border: 1px solid ${frameBorder};
          border-radius: 12px;
          background: ${frameBackground};
          box-sizing: border-box;
        "
      >
        <knob-shape
          .size=${args.size}
          .value=${args.value}
          .variant=${args.variant}
          .theme=${args.theme}
          .shape=${args.shape}
          .minAngle=${args.minAngle}
          .maxAngle=${args.maxAngle}
          .indicatorOffsetRatio=${args.indicatorOffsetRatio}
          .indicatorLengthRatio=${args.indicatorLengthRatio}
          .indicatorWidth=${args.indicatorWidth}
          .indicatorLinecap=${args.indicatorLinecap}
          .indicatorOpacity=${args.indicatorOpacity}
          .indicatorColor=${args.indicatorColor}
        ></knob-shape>
      </div>
    `
  },
  args: {
    size: 140,
    value: 0.72,
    variant: 'flat',
    theme: 'dark',
    shape: 'round',
    minAngle: -140,
    maxAngle: 140,
    indicatorOffsetRatio: 0.2,
    indicatorLengthRatio: 0.58,
    indicatorWidth: 0,
    indicatorLinecap: 'round',
    indicatorOpacity: 1,
    indicatorColor: '',
  },
  argTypes: {
    size: { control: { type: 'number', min: 24, max: 320, step: 1 } },
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    variant: { control: { type: 'select' }, options: [...UI_VARIANTS] },
    theme: { control: { type: 'select' }, options: [...UI_THEMES] },
    shape: { control: { type: 'select' }, options: [...UI_SHAPES] },
    minAngle: { control: { type: 'number', min: -360, max: 360, step: 1 } },
    maxAngle: { control: { type: 'number', min: -360, max: 360, step: 1 } },
    indicatorOffsetRatio: {
      control: { type: 'range', min: 0, max: 0.98, step: 0.01 },
    },
    indicatorLengthRatio: {
      control: { type: 'range', min: 0.02, max: 1, step: 0.01 },
    },
    indicatorWidth: { control: { type: 'number', min: 0, max: 32, step: 0.1 } },
    indicatorLinecap: {
      control: { type: 'select' },
      options: [...INDICATOR_LINECAP_OPTIONS],
    },
    indicatorOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    indicatorColor: { control: { type: 'text' } },
  },
}

export default meta

export const Default = {}

export const Neon = {
  args: {
    variant: 'neon',
    value: 0.9,
  },
}

export const Linear = {
  args: {
    shape: 'linear',
    indicatorLinecap: 'butt',
    indicatorOffsetRatio: 0.45,
    indicatorLengthRatio: 0.35,
    value: 0.36,
  },
}
