import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: surface', () => {
  it('resolves surface token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('surface')
    expect(style.stroke?.color).toBe('#1f2937')
    expect(style.stroke?.width).toBe(2)
    expect(style.fill?.color).toBe('transparent')
  })
})
