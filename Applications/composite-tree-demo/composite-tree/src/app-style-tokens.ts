import type { IStyleToken } from '@monorepo/core-style-system';

export const APP_STYLE_TOKENS = {
  base: {
    name: 'base',
    style: {
      stroke: { color: 'transparent', width: 1, dash: [] },
      fill: { color: 'transparent' },
      opacity: 1,
    },
  },
  grid: {
    name: 'grid',
    extends: ['base'],
    style: {
      stroke: { color: '#cbd5e1', width: 1, dash: [2, 6] },
      opacity: 0.9,
    },
  },
  'axis-x': {
    name: 'axis-x',
    extends: ['base'],
    style: {
      stroke: { color: '#b91c1c', width: 3.4 },
    },
  },
  'axis-y': {
    name: 'axis-y',
    extends: ['base'],
    style: {
      stroke: { color: '#1d4ed8', width: 3.4 },
    },
  },
  line: {
    name: 'line',
    extends: ['base'],
    style: {
      stroke: { color: '#2563eb', width: 3 },
    },
  },
  surface: {
    name: 'surface',
    extends: ['base'],
    style: {
      stroke: { color: '#1f2937', width: 2 },
      fill: { color: 'transparent' },
    },
  },
  vertex: {
    name: 'vertex',
    extends: ['base'],
    style: {
      stroke: { color: '#0f172a', width: 1.8 },
      fill: { color: '#0f172a' },
    },
  },
  'circle-primary': {
    name: 'circle-primary',
    extends: ['surface'],
    style: {
      stroke: { color: '#0f766e', width: 3 },
      fill: { color: 'rgba(15, 118, 110, 0.18)' },
    },
  },
} as const satisfies Record<string, IStyleToken>;
