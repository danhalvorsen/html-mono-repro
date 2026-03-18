import { describe, expect, it } from 'vitest'
import { AppDesignPolicyFixture } from '../fixtures/AppDesignPolicyFixture.js'

describe('token group: base', () => {
  it('resolves base token', () => {
    const style = new AppDesignPolicyFixture().resolveShape('base')
    expect(style.stroke?.color).toBe('transparent')
    expect(style.stroke?.width).toBe(1)
    expect(style.fill?.color).toBe('transparent')
    expect(style.opacity).toBe(1)
  })
})
