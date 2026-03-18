import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from './fixtures/AppDesignPolicyFixture.js'

describe('style tokens: circle', () => {
  it('resolves circle-primary token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('circle-primary')
    expect(style.stroke?.color).toBe('#0f766e')
    expect(style.stroke?.width).toBe(3)
    expect(style.fill?.color).toBe('rgba(15, 118, 110, 0.18)')
  })
})
