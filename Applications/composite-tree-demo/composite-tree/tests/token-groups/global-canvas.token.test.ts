import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: global canvas', () => {
  it('resolves global canvas token', () => {
    const cfg = new AppDesignPolicyFixture().resolveGlobal('canvas')
    expect(cfg.root?.['--canvas-safe-margin']).toBe('14px')
  })
})
