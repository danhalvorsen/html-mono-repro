import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: global base', () => {
  it('resolves global base token', () => {
    const cfg = new AppDesignPolicyFixture().resolveGlobal('base')
    expect(cfg.root?.['color-scheme']).toBe('light')
    expect(cfg.body?.['min-width']).toBe('320px')
  })
})
