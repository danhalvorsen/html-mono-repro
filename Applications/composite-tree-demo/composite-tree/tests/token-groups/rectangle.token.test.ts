import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: rectangle', () => {
  it('resolves rectangle token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('rectangle')
    expect(style.stroke?.color).toBe('#0f766e')
    expect(style.stroke?.width).toBe(2.5)
    expect(style.fill?.color).toBe('rgba(15, 118, 110, 0.16)')
  })
})
