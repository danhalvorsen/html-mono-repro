import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: global app', () => {
  it('resolves global app token', () => {
    const cfg = new AppDesignPolicyFixture().resolveGlobal('app')
    expect(cfg.root?.background).toBeDefined()
    expect(cfg.body?.background).toBeDefined()
  })
})
