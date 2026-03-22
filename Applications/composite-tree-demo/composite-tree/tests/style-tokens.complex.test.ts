import { describe, expect, it } from 'vitest'
import { ComplexStyleTokensFixture } from './fixtures/ComplexStyleTokensFixture.js'

describe('style tokens: complex behavior', () => {
  const fixture = new ComplexStyleTokensFixture()

  it('debug-border keeps deep inheritance and final overrides', () => {
    const style = fixture.resolveShape('debug-border')

    expect(style.stroke?.color).toBe('rgba(239, 68, 68, 0.9)')
    expect(style.stroke?.width).toBe(1)
    expect(style.stroke?.dash).toEqual([6, 4])
    expect(style.fill?.color).toBe('transparent')
    expect(style.opacity).toBe(1)
  })

  it('axis-x inherits line baseline and overrides color/width', () => {
    const style = fixture.resolveShape('axis-x')

    expect(style.stroke?.color).toBe('#b91c1c')
    expect(style.stroke?.width).toBe(3.4)
    expect(style.stroke?.dash).toEqual([])
    expect(style.fill?.color).toBe('transparent')
    expect(style.opacity).toBe(1)
  })

  it('policy propagates line color to plain vertex token', () => {
    const endpointStyle = fixture.resolveEndpointFromLineColor('axis-y', { token: 'vertex' })

    expect(endpointStyle.stroke?.color).toBe('#1d4ed8')
    expect(endpointStyle.fill?.color).toBe('#1d4ed8')
  })

  it('policy does not override explicit vertex color override', () => {
    const endpointStyle = fixture.resolveEndpointFromLineColor('axis-y', {
      token: 'vertex',
      overrides: { fill: { color: '#ff00aa' } },
    })

    expect(endpointStyle.fill?.color).toBe('#ff00aa')
  })

  it('global canvas token stacks base + app + canvas config', () => {
    const config = fixture.resolveGlobal('canvas')

    expect(config.root?.['color-scheme']).toBe('light')
    expect(config.root?.background).toBeDefined()
    expect(config.root?.['--canvas-safe-margin']).toBe('14px')
    expect(config.body?.['min-height']).toBe('100svh')
  })
})
