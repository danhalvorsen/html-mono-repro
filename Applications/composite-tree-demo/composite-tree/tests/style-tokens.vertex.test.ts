import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from './fixtures/AppDesignPolicyFixture.js'

describe('style tokens: vertex', () => {
  it('resolves vertex token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('vertex')
    expect(style.stroke?.color).toBe('#0f172a')
    expect(style.stroke?.width).toBe(1.8)
    expect(style.fill?.color).toBe('#0f172a')
  })
})
