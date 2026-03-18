import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from './fixtures/AppDesignPolicyFixture.js'

describe('style tokens: line', () => {
  it('resolves line token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('line')
    expect(style.stroke?.color).toBe('#2563eb')
    expect(style.stroke?.width).toBe(3)
  })

  it('resolves line-element token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('line-element')
    expect(style.stroke?.color).toBe('#1d4ed8')
    expect(style.stroke?.width).toBe(2.75)
    expect(style.stroke?.dash).toEqual([8, 6])
    expect(style.opacity).toBe(0.96)
  })
})
