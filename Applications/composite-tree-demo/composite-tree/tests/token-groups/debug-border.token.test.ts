import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: debug-border', () => {
  it('resolves debug-border token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('debug-border')
    expect(style.stroke?.color).toBe('rgba(239, 68, 68, 0.9)')
    expect(style.stroke?.width).toBe(1)
    expect(style.stroke?.dash).toEqual([6, 4])
    expect(style.fill?.color).toBe('transparent')
  })
})
