import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: axis-x', () => {
  it('resolves axis-x token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('axis-x')
    expect(style.stroke?.color).toBe('#b91c1c')
    expect(style.stroke?.width).toBe(3.4)
  })
})
