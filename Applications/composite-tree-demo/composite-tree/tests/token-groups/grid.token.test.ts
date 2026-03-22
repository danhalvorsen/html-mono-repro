import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: grid', () => {
  it('resolves grid token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('grid')
    expect(style.stroke?.color).toBe('#cbd5e1')
    expect(style.stroke?.width).toBe(1)
    expect(style.stroke?.dash).toEqual([])
    expect(style.opacity).toBe(0.9)
  })
})
