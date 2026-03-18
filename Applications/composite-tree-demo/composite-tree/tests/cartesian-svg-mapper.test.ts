import { describe, expect, it } from 'vitest'

import { CartesianSvgMapper } from '../src/rendering/CartesianSvgMapper.js'
import { CartesianSvgMapperFixture } from './fixtures/CartesianSvgMapperFixture.js'

describe('cartesian svg mapper', () => {
  it('maps svg origin to screen center', () => {
    const fixture = new CartesianSvgMapperFixture()
    const mapper = new CartesianSvgMapper(fixture.canvasWidth, fixture.canvasHeight)

    const screen = mapper.svgToScreen({ x: 0, y: 0 }, fixture.createRect())

    expect(screen.x).toBe(fixture.left + fixture.width / 2)
    expect(screen.y).toBe(fixture.top + fixture.height / 2)
  })

  it('maps screen center to svg origin', () => {
    const fixture = new CartesianSvgMapperFixture()
    const mapper = new CartesianSvgMapper(fixture.canvasWidth, fixture.canvasHeight)

    const svg = mapper.screenToSvg(
      { x: fixture.left + fixture.width / 2, y: fixture.top + fixture.height / 2 },
      fixture.createRect(),
    )

    expect(svg.x).toBe(0)
    expect(svg.y).toBe(0)
  })

  it('round trips svg -> screen -> svg', () => {
    const fixture = new CartesianSvgMapperFixture()
    const mapper = new CartesianSvgMapper(fixture.canvasWidth, fixture.canvasHeight)
    const source = { x: 37.5, y: -22.25 }

    const screen = mapper.svgToScreen(source, fixture.createRect())
    const restored = mapper.screenToSvg(screen, fixture.createRect())

    expect(restored.x).toBeCloseTo(source.x)
    expect(restored.y).toBeCloseTo(source.y)
  })
})
