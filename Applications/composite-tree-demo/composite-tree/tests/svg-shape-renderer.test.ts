import { describe, expect, it } from 'vitest'

import { SvgShapeRendererFixture } from './fixtures/SvgShapeRendererFixture.js'

describe('svg shape renderer', () => {
  it('renders axis shape with axis metadata and resolved style values', () => {
    const fixture = new SvgShapeRendererFixture()
    const renderer = fixture.createRenderer()
    const axis = fixture.createAxisX()

    const result = renderer.renderShape(axis)

    expect(result.strings.join('')).toContain('data-axis-name')
    expect(result.values).toContain('x')
    expect(result.values).toContain('#b91c1c')
  })
})
