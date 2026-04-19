import { html } from 'lit'

import './circle-shape.js'

interface CircleShapeStoryArgs {
  readonly radius: number
  readonly fill: string
  readonly stroke: string
  readonly strokeWidth: number
}

const meta = {
  title: 'UI-Controls/Circle Shape',
  tags: ['autodocs'],
  render: (args: CircleShapeStoryArgs) => html`
    <circle-shape
      .radius=${args.radius}
      .fill=${args.fill}
      .stroke=${args.stroke}
      .strokeWidth=${args.strokeWidth}
    ></circle-shape>
  `,
  args: {
    radius: 60,
    fill: '#1d9bf0',
    stroke: '#0b5a8f',
    strokeWidth: 1.5,
  },
  argTypes: {
    radius: { control: { type: 'number', min: 2, max: 180, step: 1 } },
    fill: { control: { type: 'color' } },
    stroke: { control: { type: 'color' } },
    strokeWidth: { control: { type: 'number', min: 0, max: 24, step: 0.1 } },
  },
}

export default meta

export const Default = {}

export const ThinOutline = {
  args: {
    fill: 'transparent',
    strokeWidth: 1,
  },
}

export const Bold = {
  args: {
    radius: 78,
    strokeWidth: 5,
  },
}
