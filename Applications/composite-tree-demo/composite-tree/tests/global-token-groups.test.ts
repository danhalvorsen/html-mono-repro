import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from './fixtures/AppDesignPolicyFixture.js'

describe('global token groups', () => {
  const fixture = new AppDesignPolicyFixture()

  it('resolves base global token', () => {
    const base = fixture.resolveGlobal('base')

    expect(base.root?.['color-scheme']).toBe('light')
    expect(base.body?.['min-width']).toBe('320px')
  })

  it('resolves app global token inheritance', () => {
    const app = fixture.resolveGlobal('app')

    expect(app.root?.background).toBeDefined()
    expect(app.body?.background).toBeDefined()
  })

  it('resolves canvas global token with safe margin var', () => {
    const canvas = fixture.resolveGlobal('canvas')

    expect(canvas.root?.['--canvas-safe-margin']).toBe('14px')
  })
})
