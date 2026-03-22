import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from './fixtures/AppDesignPolicyFixture.js'

describe('style token groups', () => {
  const fixture = new AppDesignPolicyFixture()

  const expectedStrokeColor: Readonly<Record<string, string>> = {
    base: 'transparent',
    grid: '#cbd5e1',
    line: '#2563eb',
    'line-element': '#1d4ed8',
    'axis-x': '#b91c1c',
    'axis-y': '#1d4ed8',
    surface: '#1f2937',
    rectangle: '#0f766e',
    'debug-border': 'rgba(239, 68, 68, 0.9)',
    vertex: '#0f172a',
    'circle-primary': '#0f766e',
  }

  it('resolves every shape token group with expected stroke color', () => {
    for (const [token, strokeColor] of Object.entries(expectedStrokeColor)) {
      const style = fixture.resolveShape(token)
      expect(style.stroke?.color).toBe(strokeColor)
    }
  })

  it('resolves core inherited defaults for every group', () => {
    for (const token of Object.keys(expectedStrokeColor)) {
      const style = fixture.resolveShape(token)
      expect(style.opacity).toBeDefined()
      expect(style.fill?.color).toBeDefined()
      expect(style.stroke?.width).toBeDefined()
    }
  })
})
