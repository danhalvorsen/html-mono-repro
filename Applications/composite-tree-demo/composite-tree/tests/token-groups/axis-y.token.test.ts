import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: axis-y', () => {
  it('resolves axis-y token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('axis-y')
    expect(style.stroke?.color).toBe('#1d4ed8')
    expect(style.stroke?.width).toBe(3.4)
  })
})
