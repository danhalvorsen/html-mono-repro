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
      stroke: { color: '#cbd5e1', width: 1, dash: [] },
      opacity: 0.9,
    },
  },
  'axis-x': {
    name: 'axis-x',
    extends: ['line'],
    style: {
      stroke: { color: '#b91c1c', width: 3.4 },
    },
  },
  'axis-y': {
    name: 'axis-y',
    extends: ['line'],
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
  'line-element': {
    name: 'line-element',
    extends: ['line'],
    style: {
      stroke: { color: '#1d4ed8', width: 2.75, dash: [8, 6] },
      opacity: 0.96,
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
  rectangle: {
    name: 'rectangle',
    extends: ['surface'],
    style: {
      stroke: { color: '#0f766e', width: 2.5 },
      fill: { color: 'rgba(15, 118, 110, 0.16)' },
    },
  },
  'debug-border': {
    name: 'debug-border',
    extends: ['rectangle'],
    style: {
      stroke: { color: 'rgba(239, 68, 68, 0.9)', width: 1, dash: [6, 4] },
      fill: { color: 'transparent' },
      opacity: 1,
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
